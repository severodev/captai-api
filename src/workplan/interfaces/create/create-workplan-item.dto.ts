import { ApiProperty } from "@nestjs/swagger";
import { WPIFundPerMonth } from "../../../workplan/entity/wpi-fund-per-month.entity";
import { CreateWPIBooksJournalsDto } from "./create-wpi-books-journals.dto";
import { CreateWPICivilEngineeringDto } from "./create-wpi-civil-eng.dto";
import { CreateWPICorrelatedDto } from "./create-wpi-correlated.dto";
import { CreateWPIEquipmentAndSoftwareDto } from "./create-wpi-equipment-and-software.dto";
import { CreateWPIEquipmentDto } from "./create-wpi-equipment.dto";
import { CreateWPIHumanResourcesDto } from "./create-wpi-human-resources.dto";
import { CreateWPIInstituteCostDto } from "./create-wpi-institute-cost.dto";
import { CreateWPIServiceDto } from "./create-wpi-services.dto";
import { CreateWPISoftwareLicensesDto } from "./create-wpi-software-licenses.dto";
import { CreateWPISuppliesDto } from "./create-wpi-supplies.dto";
import { CreateWPITrainingDto } from "./create-wpi-training.dto";
import { CreateWPITripDto } from "./create-wpi-trip.dto";

export class CreateWorkplanItemDto {

    @ApiProperty({ example: '10' })
    idProject: number;

    @ApiProperty({ example: 'RH_DIRECT', description: 'The workplan category' })
    category: string;

    @ApiProperty({ example: '55000', description: 'Expected value to be consumed by this workplan item' })
    value: number;

    @ApiProperty({ example: 'This value is allocated for possible workshop trips during the project execution', description: 'The workplan item descritpion' })
    rationale?: string;

    @ApiProperty({ example: 'Development', description: 'Project stage when this workplan item should take place' })
    projectStage?: string;

    @ApiProperty({ description: 'Human Resources related details', type: CreateWPIHumanResourcesDto })
    wpiHR?: CreateWPIHumanResourcesDto;

    @ApiProperty({ description: 'Trip related details', type: CreateWPITripDto })
    wpiTrip?: CreateWPITripDto;

    @ApiProperty({ description: 'Training details', type: CreateWPITrainingDto })
    wpiTraining?: CreateWPITrainingDto;

    @ApiProperty({ description: 'Service details', type: CreateWPIServiceDto })
    wpiService?: CreateWPIServiceDto;

    @ApiProperty({ description: 'Equipment details', type: CreateWPIEquipmentDto })
    wpiEquipment?: CreateWPIEquipmentDto;

    @ApiProperty({ description: 'Software licenses details', type: CreateWPISoftwareLicensesDto })
    wpiSoftwareLicenses?: CreateWPISoftwareLicensesDto;

    @ApiProperty({ description: 'Equipment and software details', type: CreateWPIEquipmentAndSoftwareDto })
    wpiEquipmentAndSoftware?: CreateWPIEquipmentAndSoftwareDto;

    @ApiProperty({ description: 'Supplies details', type: CreateWPISuppliesDto })
    wpiSupplies?: CreateWPISuppliesDto;

    @ApiProperty({ description: 'Books and journals details', type: CreateWPIBooksJournalsDto })
    wpiBooksJournals?: CreateWPIBooksJournalsDto;

    @ApiProperty({ description: 'Civil engineering details', type: CreateWPICivilEngineeringDto })
    wpiCivilEngineering?: CreateWPICivilEngineeringDto;

    @ApiProperty({ description: 'Correlated details', type: CreateWPICorrelatedDto })
    wpiCorrelated?: CreateWPICorrelatedDto;

    @ApiProperty({ description: 'Institute cost related details', type: CreateWPIInstituteCostDto })
    wpiInstituteCost?: CreateWPIInstituteCostDto;

    @ApiProperty({ description: 'Fund per month list' })
    wpiFundPerMonth?: WPIFundPerMonth[];

}