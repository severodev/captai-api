import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsString } from "class-validator";
import { WPIFundPerMonth } from "../entity/wpi-fund-per-month.entity";
import { BudgetCategoryEnum } from "../enums/budget-category.enum";
import { WPIBooksJournalsDto } from "./wpi-books-journals.dto";
import { WPICivilEngineeringDto } from "./wpi-civil-eng.dto";
import { WPICorrelatedDto } from "./wpi-correlated.dto";
import { WPIEquipmentAndSoftwareDto } from "./wpi-equipment-and-software.dto";
import { WPIEquipmentDto } from "./wpi-equipment.dto";
import { WPIHumanResourcesDto } from "./wpi-human-resources.dto";
import { WPIInstituteCostDto } from "./wpi-institute-cost.dto";
import { WPIServiceDto } from "./wpi-services.dto";
import { WPISoftwareLicensesDto } from "./wpi-software-licenses.dto";
import { WPISuppliesDto } from "./wpi-supplies.dto";
import { WPITrainingDto } from "./wpi-training.dto";
import { WPITripDto } from "./wpi-trip.dto";

export class WorkplanItemDto {

    @IsInt()
    @ApiProperty({ example: '1', description: 'Workplan Item ID' })
    id: number;

    @IsNumber()
    @ApiProperty({ example: '10' })
    idProject: number;

    @IsString()
    @ApiProperty({ example: 'RH_DIRECT', description: 'The workplan category', enum: BudgetCategoryEnum })
    category: string;

    @IsNumber()
    @ApiProperty({ example: '55000', description: 'Expected value to be consumed by this workplan item' })
    value: number;

    @IsString()
    @ApiProperty({ example: 'This value is being allocated for ....', description: 'The workplan item justification or general description.' })
    rationale?: string;

    @IsString()
    @ApiProperty({ example: 'Development', description: 'Project stage when this workplan item should take place' })
    projectStage?: string;

    @ApiProperty({ description: 'Human Resources related details', type: WPIHumanResourcesDto })
    wpiHR?: WPIHumanResourcesDto;

    @ApiProperty({ description: 'Trip related details', type: WPITripDto })
    wpiTrip?: WPITripDto;

    @ApiProperty({ description: 'Training details', type: WPITrainingDto })
    wpiTraining?: WPITrainingDto;

    @ApiProperty({ description: 'Service details', type: WPIServiceDto })
    wpiService?: WPIServiceDto;

    @ApiProperty({ description: 'Equipment details', type: WPIEquipmentDto })
    wpiEquipment?: WPIEquipmentDto;

    @ApiProperty({ description: 'Software licenses details', type: WPISoftwareLicensesDto })
    wpiSoftwareLicenses?: WPISoftwareLicensesDto;
    
    @ApiProperty({ description: 'Equipment and software details', type: WPIEquipmentAndSoftwareDto })
    wpiEquipmentAndSoftware?: WPIEquipmentAndSoftwareDto;

    @ApiProperty({ description: 'Supplies details', type: WPISuppliesDto })
    wpiSupplies?: WPISuppliesDto;

    @ApiProperty({ description: 'Books and journals details', type: WPIBooksJournalsDto })
    wpiBooksJournals?: WPIBooksJournalsDto;

    @ApiProperty({ description: 'Civil engineering details', type: WPICivilEngineeringDto })
    wpiCivilEngineering?: WPICivilEngineeringDto;

    @ApiProperty({ description: 'Correlated details', type: WPICorrelatedDto })
    wpiCorrelated?: WPICorrelatedDto;

    @ApiProperty({ description: 'Institute cost related details', type: WPIInstituteCostDto })
    wpiInstituteCost?: WPIInstituteCostDto;

    @ApiProperty({ description: 'Fund per month list', type: WPIFundPerMonth })
    wpiFundPerMonth?: WPIFundPerMonth[];

}