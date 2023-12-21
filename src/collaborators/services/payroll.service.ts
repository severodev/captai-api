import { Inject, Injectable, NotFoundException } from '@nestjs/common';
// import { ModuleRef } from '@nestjs/core';
import moment from 'moment-business-days';
import { I18nContext } from 'nestjs-i18n';
import { FindManyOptions, In, Repository } from 'typeorm';
import { AudityEntryDto } from '../../audit/interface/audit-entry.dto';
import { AuditService } from '../../audit/service/audit.service';
import { InstituteDto } from '../../institutes/interfaces/institute.dto';
import { InstitutesService } from '../../institutes/services/institutes.service';
import { ProjectDto } from '../../projects/interfaces/project.dto';
import { ProjectsService } from '../../projects/services/projects.service';
import { BudgetCategory } from '../../suppliers/entity/budget-category.entity';
import { BudgetCategoryDto } from '../../suppliers/interfaces/budget-category.dto';
import { UtilService } from '../../util/services/util.service';
import { BenefitType } from '../entity/benefit-type.entity';
import { Benefit } from '../entity/benefit.entity';
import { IRRFRule } from '../entity/irrf-rule.entity';
import { PaymentComponent } from '../entity/payment-component.entity';
import { Payment } from '../entity/payment.entity';
import { PayRoll } from '../entity/payroll.entity';
import { BenefitsEnum } from '../enums/benefits.enum';
import { EmploymentRelationshipEnum } from '../enums/employment-relationship-type.enum';
import { PaymentComponentEnum } from '../enums/payment-component.enum';
import { CollaboratorDto } from '../interfaces/collaborator.dto';
import { CreatePayRollDto } from '../interfaces/create-payroll.dto';
import { EmploymentRelationshipDto } from '../interfaces/employment-relationship.dto';
import { PaymentComponentDto } from '../interfaces/payment-component.dto';
import { PaymentDto } from '../interfaces/payment.dto';
import { PayRollDto } from '../interfaces/payroll.dto';
import { UpdateAllPaymentsStatusDto } from '../interfaces/update-all-payments-status.dto';
import { EmploymentRelationshipService } from './employment-relationship.service';
import { NotedDateService } from './noted-date.service';

enum paymentKeys {
  PAYROLL_DEFAULT_YEAR_DURATION_IN_MONTHS,
  PAYROLL_DEFAULT_MONTH_DURATION_IN_DAYS,
  CHARGE_CLT_MONTHLY,
  CHARGE_CLT_MONTHLY_FASTEF,
  BENEFIT_TRANSPORT_TICKET_VALUE,
  CHARGE_TRANSPORT_LIMIT_PERCENTAGE,
  CHARGE_TRANSPORT_LIMIT_VALUE,
  BENEFIT_MEALPLAN_VALUE,
  CHARGE_MEALPLAN_VALUE,
  BENEFIT_GAS_VALUE,
  BENEFIT_KINDERGARTEN_VALUE,
  CHARGE_HEALTHCARE_VALUE,
  BENEFIT_TRANSPORT_INTERNSHIP_FASTEF,
  CHARGE_RAW_RPA_INSS,
  CHARGE_RAW_RPA_ISS,
  CHARGE_RAW_RPA_EMPLOYER_INSS,
}
@Injectable()
export class PayrollService {
  private projectService: ProjectsService;

  constructor(
    @Inject('PAYROLL_REPOSITORY')
    private payrollRepository: Repository<PayRoll>,
    @Inject('IRRF_RULE_REPOSITORY')
    private irrfRuleRepository: Repository<IRRFRule>,
    @Inject('PAYMENT_REPOSITORY')
    private paymentRepository: Repository<Payment>,
    @Inject('PAYMENT_COMPONENT_REPOSITORY')
    private paymentComponentRepository: Repository<PaymentComponent>,
    private readonly instituteService: InstitutesService,
    private readonly erService: EmploymentRelationshipService,
    private readonly utilService: UtilService,
    private readonly notedDateService: NotedDateService,
    // @Inject(forwardRef(() => ProjectsService))
    // private readonly projectService: ProjectsService,
    // private moduleRef: ModuleRef,
    private readonly auditService: AuditService,
  ) { }

  async getProjectsByPayroll(
    idCollaborator: number,
    idsER?: number[],
  ): Promise<PayRollDto[]> {
    const filters: FindManyOptions<PayRoll> = {
      where: {
        collaborator: idCollaborator,
      },
    };

    if (idsER && idsER.length > 0) {
      filters.where = {
        collaborator: idCollaborator,
        employmentRelationship: In(idsER),
      };
    }

    const result = await this.payrollRepository.find({
      where: filters.where,
      relations: ['project', 'institute', 'employmentRelationship'],
    });

    return (
      result &&
      result.map(
        pr =>
          <PayRollDto>{
            id: pr.id,
            jobTitle: pr.jobTitle,
            employmentRelationship: <EmploymentRelationshipDto>{
              id: pr.employmentRelationship.id,
              code: pr.employmentRelationship.code,
              name: pr.employmentRelationship.name,
            },
            project: <ProjectDto>{
              id: pr.project.id,
              name: pr.project.name,
            },
            institute: <InstituteDto>{
              id: pr.institute.id,
              abbreviation: pr.institute.abbreviation,
            },
          },
      )
    );
  }

  async getPaymentsByProject(
    idProject: number,
    annotationOnly = false,
  ): Promise<PaymentDto[]> {
    const payments: Payment[] = [];

    try {
      // const result = await this.payrollRepository.find({
      //   relations: [
      //     'collaborator'
      //     // 'employmentRelationship',
      //     // 'budgetCategory',
      //     // 'payments',
      //     // 'payments.components',
      //   ],
      //   where: { project: idProject, active: true },
      // });

      const _r = this.paymentRepository
          .createQueryBuilder('payment')
          .innerJoinAndSelect('payment.components', 'components')
          .innerJoinAndSelect('payment.payroll', 'payroll')
          .innerJoinAndSelect('payroll.collaborator', 'collaborator')
          .innerJoinAndSelect('payroll.employmentRelationship', 'employmentRelationship')
          .innerJoinAndSelect('payroll.budgetCategory', 'budgetCategory')
          .where('payroll.project = :projectId', { projectId: idProject })
          .andWhere('payroll.active = :active', { active: true });

      const result = await _r.getMany();

      // if (result) {
      //   for (const pRoll of result) {
      //     pRoll.payments = await this.paymentRepository.find({ where: { payroll: pRoll.id }, relations: ["components"] });
      //     payments.push(...pRoll.payments);
      //   }
      // }

      if (result) {
        payments.push(...result);
      }

      if (annotationOnly) {
        payments.forEach(pmt => {
          pmt.components = pmt.components.filter(pc => pc.type == 'Anotação');
        });
      }

      return (
        payments &&
        payments.map(p => {
          const payroll = p.payroll;

          const collaboratorTotalPayments =
            payroll &&
            payments
              .filter(_p => _p.payroll.id == payroll.id && _p.year == p.year && _p.month == p.month)
              .reduce((soma, pay) => {
                return soma + pay.totalValue;
              }, 0);
          const totalPaymentsFixed = collaboratorTotalPayments
            .toFixed(2)
            .replace('.', ',');

          return <PaymentDto>{
            id: p.id,
            year: p.year,
            month: p.month,
            paid: p.paid,
            totalValue: p.components.reduce(
              (soma, comp) => soma + comp.value,
              0,
            ),
            components: p.components.map(
              pc =>
                <PaymentComponentDto>{
                  id: pc.id,
                  type: pc.type,
                  value: pc.value,
                  leadCompensation: pc.leadCompensation,
                  description: pc.description,
                },
            ),
            budgetCategory: <BudgetCategoryDto>{
              id: payroll.budgetCategory.id,
              code: payroll.budgetCategory.code,
              name: payroll.budgetCategory.name,
            },
            employmentRelationship: <EmploymentRelationshipDto>{
              id: payroll.employmentRelationship.id,
              code: payroll.employmentRelationship.code,
              name: payroll.employmentRelationship.name
            },
            jobTitle: payroll.jobTitle,
            collaboratorInfo: `${payroll.collaborator.name} (${payroll.jobTitle}, ${payroll.employmentRelationship.name} - R$ ${totalPaymentsFixed})`,
            collaborator: <CollaboratorDto>{
              id: payroll.collaborator.id,
              name: payroll.collaborator.name,
            },
          };
        })
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // async getPayrollSheetByProject(idProject: number): Promise<PaymentDto[]> {
  //   const payments: Payment[] = [];

  //   const result = await this.payrollRepository.find({
  //     where: { project: idProject },
  //     relations: [
  //       'collaborator',
  //       'employmentRelationship',
  //       'budgetCategory',
  //       'payments',
  //       'payments.components',
  //     ],
  //   });

  //   result &&
  //     result.forEach(p => {
  //       payments.push(...p.payments);
  //     });

  //   return (
  //     payments &&
  //     payments.map(p => {
  //       const payroll = result.find(
  //         r => r.payments.find(pp => pp.id == p.id) != null,
  //       );

  //       const collaboratorTotalPayments =
  //         payroll &&
  //         payroll.payments
  //           .filter(_p => _p.year == p.year && _p.month == p.month)
  //           .reduce((soma, pay) => {
  //             return soma + pay.totalValue;
  //           }, 0);
  //       const totalPaymentsFixed = collaboratorTotalPayments
  //         .toFixed(2)
  //         .replace('.', ',');

  //       return <PaymentDto>{
  //         id: p.id,
  //         year: p.year,
  //         month: p.month,
  //         totalValue: p.totalValue,
  //         components: p.components.map(
  //           pc =>
  //             <PaymentComponentDto>{
  //               id: pc.id,
  //               type: pc.type,
  //               value: pc.value,
  //               leadCompensation: pc.leadCompensation,
  //               description: pc.description
  //             },
  //         ),
  //         budgetCategory: <BudgetCategoryDto>{
  //           id: payroll.budgetCategory.id,
  //           code: payroll.budgetCategory.code,
  //           name: payroll.budgetCategory.name,
  //         },
  //         collaboratorInfo: `${payroll.collaborator.name} (${payroll.jobTitle}, ${payroll.employmentRelationship.name} - R$ ${totalPaymentsFixed})`,
  //         collaborator: <CollaboratorDto> {
  //           id: payroll.collaborator.id,
  //           name: payroll.collaborator.name
  //         }
  //       };
  //     })
  //   );
  // }

  async buildPayroll(pay: CreatePayRollDto): Promise<PayRoll> {
    const payroll = new PayRoll();

    const institute = await this.instituteService.findOne(pay.institute);
    payroll.institute = institute;

    // payroll.project = await this.projectService.findOne(pay.project);

    const er = await this.erService.findOne(pay.employmentRelationship);
    payroll.employmentRelationship = er;

    payroll.jobTitle = pay.jobTitle;
    payroll.salary = pay.salary;
    payroll.workload = pay.workload;

    payroll.budgetCategory = new BudgetCategory();
    payroll.budgetCategory.id = pay.budgetCategory;

    if (!pay.dismissal) {
      pay.dismissal = moment(payroll.project.end).format('YYYY-MM-DD');
    }

    const admission = moment(pay.admission);
    const dismissal = moment(pay.dismissal);

    payroll.admission = admission.toDate();
    payroll.dismissal = dismissal.toDate();

    payroll.benefits = [];
    if (pay.benefits && pay.benefits.length > 0) {
      for (const b of pay.benefits) {
        const benefit = new Benefit();

        benefit.benefitType = new BenefitType();
        benefit.benefitType.id = b.benefitType.id;

        benefit.institute = payroll.institute;
        benefit.project = payroll.project;

        if (b.amountValue && b.amountType) {
          benefit.amountValue = b.amountValue;
          benefit.amountType = b.amountType;
        }

        if (b.deductionValue && b.deductionType) {
          benefit.deductionValue = b.deductionValue;
          benefit.deductionType = b.deductionType;
        }

        payroll.benefits.push(benefit);
      }
    }

    payroll.payments = [];
    const defaultMonthsDuration = this.utilService.roundFromString(
      await this.utilService.findSettingsByKey(
        paymentKeys.PAYROLL_DEFAULT_YEAR_DURATION_IN_MONTHS,
      ),
    );
    const numberOfMonths = dismissal
      ? dismissal.diff(admission, 'month')
      : defaultMonthsDuration;

    // Generating payments through contract months
    const currentMonth = admission.clone();
    for (let idx = 0; idx < numberOfMonths; idx++) {
      // Base parameters
      let _monthPaymentValue = 0;
      const _paymentComponents: PaymentComponent[] = [];

      let daysWorked = 30;
      let msgDaysWorked = '';
      if (currentMonth.isSame(admission, 'month')) {
        // Calcuates worked days if admission is on current month; else default is 30 days
        daysWorked = currentMonth
          .clone()
          .endOf('month')
          .businessDiff(admission);
        msgDaysWorked = ` (${daysWorked} dias trabalhados)`;
      }

      const businessDays = currentMonth.businessDaysIntoMonth();
      const holidays = await this.notedDateService.holidaysInRange(
        currentMonth
          .clone()
          .startOf('month')
          .toDate(),
        currentMonth
          .clone()
          .endOf('month')
          .toDate(),
      );

      switch (er.code) {
        case EmploymentRelationshipEnum.CLT: {
          const computedSalary = this.utilService.round(
            (payroll.salary / 30) * daysWorked,
          );

          // Benefits Components
          let discountsFromBenefits = 0;
          for (const b of payroll.benefits) {
            switch (b.benefitType.code) {
              case BenefitsEnum.VT: {
                const transportChargeMax = this.utilService.roundFromString(
                  await this.utilService.findSettingsByKey(
                    paymentKeys.CHARGE_TRANSPORT_LIMIT_VALUE,
                  ),
                );

                const transportChargePercentage = this.utilService.roundFromString(
                  await this.utilService.findSettingsByKey(
                    paymentKeys.CHARGE_TRANSPORT_LIMIT_PERCENTAGE,
                  ),
                );
                const transportQuotaOverSalary =
                  computedSalary * transportChargePercentage;

                const transportTicketValue = this.utilService.roundFromString(
                  await this.utilService.findSettingsByKey(
                    paymentKeys.BENEFIT_TRANSPORT_TICKET_VALUE,
                  ),
                );
                const transportPaidValue =
                  transportTicketValue *
                  (daysWorked != 30
                    ? daysWorked
                    : businessDays - holidays.length);

                const costs = [
                  {
                    label: `Desconto do valor limite: R$ ${transportChargeMax}`,
                    value: transportChargeMax,
                  },
                  {
                    label: `Desconto do valor da recarga: R$ ${transportPaidValue}`,
                    value: transportPaidValue,
                  },
                  {
                    label: `Desconto da cota do salário (${transportChargePercentage}% de R$ ${computedSalary}): R$ ${transportChargeMax}`,
                    value: transportQuotaOverSalary,
                  },
                ];
                costs.sort(function (a, b) {
                  return a.value - b.value;
                });

                const vtBenefit = new PaymentComponent();
                vtBenefit.type = PaymentComponentEnum.BENEFIT;
                vtBenefit.description = `Vale Transporte CLT${msgDaysWorked}`;
                vtBenefit.value = transportPaidValue;
                vtBenefit.leadCompensation =
                  transportPaidValue - costs[0].value;
                vtBenefit.notes = costs[0].label;

                _paymentComponents.push(vtBenefit);

                discountsFromBenefits += costs[0].value;
                const vtDiscount = new PaymentComponent();
                vtDiscount.type = PaymentComponentEnum.DISCOUNT;
                vtDiscount.description = `Desconto Vale Transporte CLT${msgDaysWorked}`;
                vtDiscount.value = costs[0].value;

                _paymentComponents.push(vtDiscount);

                break;
              }
              case BenefitsEnum.VA: {
                const mealplanValue = this.utilService.roundFromString(
                  await this.utilService.findSettingsByKey(
                    paymentKeys.BENEFIT_MEALPLAN_VALUE,
                  ),
                );
                const computedMealplanValue =
                  (mealplanValue / 30) * (daysWorked != 30 ? daysWorked : 30);

                const vaBenefit = new PaymentComponent();
                vaBenefit.type = PaymentComponentEnum.BENEFIT;
                vaBenefit.description = `Vale Alimentação CLT${msgDaysWorked}`;
                vaBenefit.value = computedMealplanValue;

                _paymentComponents.push(vaBenefit);

                const mealplanDiscount = this.utilService.roundFromString(
                  await this.utilService.findSettingsByKey(
                    paymentKeys.CHARGE_MEALPLAN_VALUE,
                  ),
                );
                discountsFromBenefits += mealplanDiscount;

                const vaDiscount = new PaymentComponent();
                vaDiscount.type = PaymentComponentEnum.DISCOUNT;
                vaDiscount.description = `Desconto Vale Alimentação CLT${msgDaysWorked}`;
                vaDiscount.value = mealplanDiscount;

                _paymentComponents.push(vaDiscount);

                break;
              }
              case BenefitsEnum.VC: {
                const gasValue = this.utilService.roundFromString(
                  await this.utilService.findSettingsByKey(
                    paymentKeys.BENEFIT_GAS_VALUE,
                  ),
                );

                const vcBenefit = new PaymentComponent();
                vcBenefit.type = PaymentComponentEnum.BENEFIT;
                vcBenefit.description = `Vale Combustível CLT${msgDaysWorked}`;
                vcBenefit.value = gasValue;

                _paymentComponents.push(vcBenefit);

                // No discount for this modality

                break;
              }
              case BenefitsEnum.VCR: {
                const kindergartenValue = this.utilService.roundFromString(
                  await this.utilService.findSettingsByKey(
                    paymentKeys.BENEFIT_KINDERGARTEN_VALUE,
                  ),
                );

                const vcrBenefit = new PaymentComponent();
                vcrBenefit.type = PaymentComponentEnum.BENEFIT;
                vcrBenefit.description = `Vale Creche CLT${msgDaysWorked}`;
                vcrBenefit.value = kindergartenValue;

                _paymentComponents.push(vcrBenefit);

                break;
              }
              case BenefitsEnum.PS: {
                // TODO: custo do plano de saúde por colaborador?
                // Salvar em um lugar separado?

                const healthcareDiscount = this.utilService.roundFromString(
                  await this.utilService.findSettingsByKey(
                    paymentKeys.CHARGE_HEALTHCARE_VALUE,
                  ),
                );
                discountsFromBenefits += healthcareDiscount;

                const vaDiscount = new PaymentComponent();
                vaDiscount.type = PaymentComponentEnum.DISCOUNT;
                vaDiscount.description = `Desconto Plano de Saúde CLT${msgDaysWorked}`;
                vaDiscount.value = healthcareDiscount;

                _paymentComponents.push(vaDiscount);

                break;
              }
              default: {
                console.log(
                  `Unkown type of benefit: ${b.benefitType.name} (Code: ${b.benefitType.code})`,
                );
              }
            }
          }

          // Salary Components
          const salaryComponent = new PaymentComponent();
          salaryComponent.type = PaymentComponentEnum.SALARY;
          salaryComponent.description = `Salário CLT - ${pay.jobTitle}${msgDaysWorked}`;
          salaryComponent.value = computedSalary - discountsFromBenefits;
          salaryComponent.notes = `Descontos : R$ ${discountsFromBenefits}`;

          _paymentComponents.push(salaryComponent);

          // Charges Components
          const chargeRate = await this.utilService.findSettingsByKey(
            institute.abbreviation.toUpperCase() == 'FASTEF'
              ? paymentKeys.CHARGE_CLT_MONTHLY_FASTEF
              : paymentKeys.CHARGE_CLT_MONTHLY,
          );
          const cltCharges = new PaymentComponent();
          cltCharges.type = PaymentComponentEnum.CHARGES;
          cltCharges.description = `Encargos CLT${msgDaysWorked}`;
          cltCharges.value =
            computedSalary * this.utilService.roundFromString(chargeRate);

          _paymentComponents.push(cltCharges);

          break;
        }

        case EmploymentRelationshipEnum.RPA_B: {
          // RAW RPA Calculation: 11% INSS + 5% ISS + 20% Employer INSS Contribution + IRPF (based on database-managed quota range)
          // INSS = 11% * Raw Value
          // ISS = 5% * Raw Value
          // Employer INSS = 20% * Raw Value
          // IRRF = (Range Percentage * Raw Vale) - (Range Value)
          // ----------------------------------------------------
          // Company Cost = Raw Value + Employer INSS
          // Salary = Company Cost - (INSS + ISS + Employer INSS + IRRF)

          let totalDeductions = 0;

          // CHARGE_RAW_RPA_INSS,
          // CHARGE_RAW_RPA_ISS,
          // CHARGE_RAW_RPA_EMPLOYER_INSS

          // INSS
          const inssCharge = await this.utilService.findSettingsByKey(
            paymentKeys.CHARGE_RAW_RPA_INSS,
          );

          const inss = new PaymentComponent();
          inss.type = PaymentComponentEnum.CHARGES;
          inss.description = `INSS (${inssCharge}%)`;
          inss.value =
            payroll.salary *
            (this.utilService.roundFromString(inssCharge) / 100);

          _paymentComponents.push(inss);

          // ISS
          const issCharge = await this.utilService.findSettingsByKey(
            paymentKeys.CHARGE_RAW_RPA_ISS,
          );

          const iss = new PaymentComponent();
          iss.type = PaymentComponentEnum.CHARGES;
          iss.description = `ISS (${issCharge}%)`;
          iss.value =
            payroll.salary * this.utilService.roundFromString(issCharge);

          _paymentComponents.push(iss);

          // Employer INSS
          const employerInssCharge = await this.utilService.findSettingsByKey(
            paymentKeys.CHARGE_RAW_RPA_EMPLOYER_INSS,
          );

          const employerInss = new PaymentComponent();
          employerInss.type = PaymentComponentEnum.CHARGES;
          employerInss.description = `INSS Patronal (${employerInssCharge}%)`;
          employerInss.value =
            payroll.salary *
            (this.utilService.roundFromString(employerInssCharge) / 100);

          _paymentComponents.push(employerInss);

          // IRRF
          const irrfMap = await this.irrfRuleRepository.find({
            where: { employmentRelationship: 6 /* RPA Bruto */ },
          });
          const irrfRange = irrfMap.find(
            r =>
              payroll.salary - inss.value >= r.lowerLimit &&
              payroll.salary - inss.value <= r.upperLimit,
          );

          const irrf = new PaymentComponent();
          irrf.type = PaymentComponentEnum.CHARGES;
          irrf.description = `IRPF (${irrfRange.quota}%)`;
          irrf.value = payroll.salary * (irrfRange.quota / 100);

          _paymentComponents.push(irrf);

          // TODO: RPA - Check real charges and deductions
          totalDeductions = inss.value + iss.value + irrf.value;

          const salaryComponent = new PaymentComponent();
          salaryComponent.type = PaymentComponentEnum.SALARY;
          salaryComponent.description = `Pagamento RPA Bruto`;
          salaryComponent.value = payroll.salary - totalDeductions;

          _paymentComponents.push(salaryComponent);
          break;
        }

        case EmploymentRelationshipEnum.RPA_L: {
          const salaryComponent = new PaymentComponent();
          salaryComponent.type = PaymentComponentEnum.SALARY;
          salaryComponent.description = `Pagamento RPA Líquido`;
          salaryComponent.value = payroll.salary;

          _paymentComponents.push(salaryComponent);

          break;
        }

        case EmploymentRelationshipEnum.B_ESTG: {
          const computedAllowance = this.utilService.round(
            (payroll.salary / 30) * daysWorked,
          );

          // Benefits Components
          for (const b of payroll.benefits) {
            switch (b.benefitType.code) {
              case BenefitsEnum.VT: {
                let transportPaidValue = 0;

                if (institute.abbreviation == 'FASTEF') {
                  transportPaidValue = this.utilService.roundFromString(
                    await this.utilService.findSettingsByKey(
                      paymentKeys.BENEFIT_TRANSPORT_INTERNSHIP_FASTEF,
                    ),
                  );
                } else {
                  const transportTicketValue = this.utilService.roundFromString(
                    await this.utilService.findSettingsByKey(
                      paymentKeys.BENEFIT_TRANSPORT_TICKET_VALUE,
                    ),
                  );
                  transportPaidValue =
                    transportTicketValue *
                    (daysWorked != 30
                      ? daysWorked
                      : businessDays - holidays.length);
                }

                const vtBenefit = new PaymentComponent();
                vtBenefit.type = PaymentComponentEnum.BENEFIT;
                vtBenefit.description = `Vale Transporte Bolsa Estágio${msgDaysWorked}`;
                vtBenefit.value = transportPaidValue;

                _paymentComponents.push(vtBenefit);

                break;
              }
              case BenefitsEnum.RR: {
                // Only student working from 6 months and up will receive this benefit
                if (numberOfMonths < 6) {
                  continue;
                }

                const paidRecess = computedAllowance / numberOfMonths;

                const rrBenefit = new PaymentComponent();
                rrBenefit.type = PaymentComponentEnum.BENEFIT;
                rrBenefit.description = `Recesso Remunerado Bolsa Estágio`;
                rrBenefit.value = paidRecess;

                _paymentComponents.push(rrBenefit);

                break;
              }
              default: {
                console.log(
                  `Unkown type of benefit: ${b.benefitType.name} (Code: ${b.benefitType.code})`,
                );
              }
            }
          }

          // Salary Components
          const salaryComponent = new PaymentComponent();
          salaryComponent.type = PaymentComponentEnum.SALARY;
          salaryComponent.description = `Bolsa Estágio${msgDaysWorked}`;
          salaryComponent.value = computedAllowance;

          _paymentComponents.push(salaryComponent);

          break;
        }
        case EmploymentRelationshipEnum.B_INOV: {
          const computedAllowance = this.utilService.round(
            (payroll.salary / 30) * daysWorked,
          );

          if (institute.abbreviation == 'IDESCO') {
            // Benefits Components
            for (const b of payroll.benefits) {
              switch (b.benefitType.code) {
                case BenefitsEnum.VT: {
                  const transportTicketValue = this.utilService.roundFromString(
                    await this.utilService.findSettingsByKey(
                      paymentKeys.BENEFIT_TRANSPORT_TICKET_VALUE,
                    ),
                  );
                  const transportPaidValue =
                    transportTicketValue *
                    (daysWorked != 30
                      ? daysWorked
                      : businessDays - holidays.length);

                  const vtBenefit = new PaymentComponent();
                  vtBenefit.type = PaymentComponentEnum.BENEFIT;
                  vtBenefit.description = `Vale Transporte Bolsa Inovação${msgDaysWorked}`;
                  vtBenefit.value = transportPaidValue;

                  _paymentComponents.push(vtBenefit);

                  break;
                }
                case BenefitsEnum.RR: {
                  // Only student working from 6 months and up will receive this benefit
                  if (numberOfMonths < 6) {
                    continue;
                  }

                  const paidRecess = computedAllowance / numberOfMonths;

                  const rrBenefit = new PaymentComponent();
                  rrBenefit.type = PaymentComponentEnum.BENEFIT;
                  rrBenefit.description = `Recesso Remunerado Bolsa Inovação`;
                  rrBenefit.value = paidRecess;

                  _paymentComponents.push(rrBenefit);

                  break;
                }
                default: {
                  console.log(
                    `Unkown type of benefit: ${b.benefitType.name} (Code: ${b.benefitType.code})`,
                  );
                }
              }
            }
          }

          // Salary Components
          const salaryComponent = new PaymentComponent();
          salaryComponent.type = PaymentComponentEnum.SALARY;
          salaryComponent.description = `Bolsa Inovação${msgDaysWorked}`;
          salaryComponent.value = computedAllowance;

          _paymentComponents.push(salaryComponent);

          break;
        }
        case EmploymentRelationshipEnum.B_OUTR: {
          const computedAllowance = this.utilService.round(
            (payroll.salary / 30) * daysWorked,
          );

          if (institute.abbreviation == 'IDESCO') {
            // Benefits Components
            for (const b of payroll.benefits) {
              switch (b.benefitType.code) {
                case BenefitsEnum.VT: {
                  const transportTicketValue = this.utilService.roundFromString(
                    await this.utilService.findSettingsByKey(
                      paymentKeys.BENEFIT_TRANSPORT_TICKET_VALUE,
                    ),
                  );
                  const transportPaidValue =
                    transportTicketValue *
                    (daysWorked != 30
                      ? daysWorked
                      : businessDays - holidays.length);

                  const vtBenefit = new PaymentComponent();
                  vtBenefit.type = PaymentComponentEnum.BENEFIT;
                  vtBenefit.description = `Vale Transporte Bolsa Outorga${msgDaysWorked}`;
                  vtBenefit.value = transportPaidValue;

                  _paymentComponents.push(vtBenefit);

                  break;
                }
                case BenefitsEnum.RR: {
                  // Only student working from 6 months and up will receive this benefit
                  if (numberOfMonths < 6) {
                    continue;
                  }

                  const paidRecess = computedAllowance / numberOfMonths;

                  const rrBenefit = new PaymentComponent();
                  rrBenefit.type = PaymentComponentEnum.BENEFIT;
                  rrBenefit.description = `Recesso Remunerado Bolsa Outorga`;
                  rrBenefit.value = paidRecess;

                  _paymentComponents.push(rrBenefit);

                  break;
                }
                default: {
                  console.log(
                    `Unkown type of benefit: ${b.benefitType.name} (Code: ${b.benefitType.code})`,
                  );
                }
              }
            }
          }

          // Salary Components
          const salaryComponent = new PaymentComponent();
          salaryComponent.type = PaymentComponentEnum.SALARY;
          salaryComponent.description = `Bolsa Outorga${msgDaysWorked}`;
          salaryComponent.value = computedAllowance;

          _paymentComponents.push(salaryComponent);

          break;
        }
        case EmploymentRelationshipEnum.B_PESQ: {
          const computedAllowance = this.utilService.round(
            (payroll.salary / 30) * daysWorked,
          );

          // Salary Components
          const salaryComponent = new PaymentComponent();
          salaryComponent.type = PaymentComponentEnum.SALARY;
          salaryComponent.description = `Bolsa Outorga${msgDaysWorked}`;
          salaryComponent.value = computedAllowance;

          _paymentComponents.push(salaryComponent);

          break;
        }
        default: {
          console.log(
            `Unkown emplyment relationship: ${er.name} (Code: ${er.code})`,
          );
        }
      }

      _monthPaymentValue = _paymentComponents.reduce((accum, p) => {
        return p.type != PaymentComponentEnum.DISCOUNT
          ? accum + p.value
          : accum;
      }, _monthPaymentValue);

      const monthPayment = <Payment>{
        year: currentMonth.format('YYYY').toString(),
        month: currentMonth.format('MM').toString(),
        components: _paymentComponents,
        totalValue: _monthPaymentValue,
      };

      payroll.payments.push(monthPayment);
    }

    return payroll;
  }

  async loadPayrollByCollaboratorAndProject(
    idCollaborator: number,
    idProject: number,
  ): Promise<PayRoll> {
    return this.payrollRepository.findOne({
      where: { collaborator: idCollaborator, project: idProject },
    });
  }

  async deletePayments(paymentIds: number[]): Promise<void> {
    try {
      await this.paymentRepository.update(paymentIds, { active: false });
    } catch (e) {
      console.error('Falha ao remover pagamentos', e);
    }
  }

  async deletePayrolls(payroll: PayRoll): Promise<void> {
    try {
      payroll.active = false;
      payroll.payments.forEach(p => p.active = false);
      await this.payrollRepository.save(payroll);
    } catch (e) {
      console.error('Falha ao remover remunerações', e);
    }
  }

  // async deleteBenefitsAndUpdatePayment(
  //   paymentId: number,
  //   benefitIds: number[],
  // ): Promise<void> {
  //   try {
  //     const payment = await this.paymentRepository.findOne(paymentId, {
  //       relations: ['payroll', 'components', 'components.benefit'],
  //     });
  //     const benefitRelatedPC = payment.components.filter(
  //       pc => pc.benefit && benefitIds.includes(pc.benefit.id),
  //     );
  //     const totalPaymentDifference = benefitRelatedPC.reduce(
  //       (total, pc) => pc.value,
  //       0,
  //     );

  //     payment.components = payment.components.filter(
  //       pc => !benefitRelatedPC.includes(pc),
  //     );
  //     payment.totalValue -= totalPaymentDifference;
  //     await this.paymentRepository.update(payment.id, payment);

  //     await this.paymentComponentRepository.delete(
  //       benefitRelatedPC.map(pc => pc.id),
  //     );
  //   } catch (e) {
  //     console.error(
  //       'Falha ao remover pagamentos relacionados ao benefícios ',
  //       benefitIds,
  //       e,
  //     );
  //   }
  // }

  async changePayrollStatus(collaboratorId: number, functionCallingSecurity: string) {
    let dbPayroll = await this.payrollRepository.find({
      where: {
        collaborator: collaboratorId,
      }
    });

    dbPayroll.map((data) => {
      let payrollLastStatus = data.active;
      if (functionCallingSecurity == 'DELETE' && payrollLastStatus == true || functionCallingSecurity == 'ACTIVATE' && payrollLastStatus == false) {
        data.active = !payrollLastStatus;
      }
    })
    
    return this.payrollRepository.save(dbPayroll);
  }

  async confirmHRPayment(
    paymentId: number,
    i18n: I18nContext,
    auditEntry: AudityEntryDto,
  ): Promise<boolean> {
    try {
      const dbEntity = await this.paymentRepository.findOne(paymentId);
      if (!dbEntity) {
        throw new NotFoundException(
          await i18n.translate('payroll.PAYMENTS.NOT_FOUND', {
            args: { id: paymentId },
          }),
        );
      }

      dbEntity.paid = !dbEntity.paid;

      await this.paymentRepository.save(dbEntity);
      return dbEntity.paid;
    } catch (error) {
      console.error(error);
    }
  }

  async confirmAllHRPayments(
    updateAllPaymentsStatusDto: UpdateAllPaymentsStatusDto,
    i18n: I18nContext,
    auditEntry: AudityEntryDto,
  ): Promise<boolean> {
    try {
      const dbEntities = await this.paymentRepository.find({ id: In(updateAllPaymentsStatusDto.paymentIds) });
      if (dbEntities) {
        dbEntities.forEach(p => p.paid = updateAllPaymentsStatusDto.status);
        await this.paymentRepository.save(dbEntities);
      }
      return updateAllPaymentsStatusDto.status;
    } catch (error) {
      console.error(error);
    }
  }

  async forcePayrollReferenceOnPayments(payroll: PayRoll): Promise<void> {
    for (const payment of payroll.payments) {
      payment.payroll = <PayRoll>{ id: payroll.id };
      this.paymentRepository.save(payment);
    }
  }

}
