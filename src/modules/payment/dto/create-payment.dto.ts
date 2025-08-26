import { SubscriptionPlan } from "@prisma/client";
import { IsEnum, IsInt , IsString} from "class-validator";


export class CreatePaymentDto {
    @IsInt()
    amount: number;

    @IsString()
    currency: string;

    @IsString()
    status: string;

    @IsInt()
    creditsAdded: number;

    @IsString()
    description: string;

    @IsEnum(SubscriptionPlan)
    plan: SubscriptionPlan;
}