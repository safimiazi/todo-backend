import { PartialType } from "@nestjs/mapped-types";
import { CreateMakeClipDto } from "./create-makeclip.dto";

export class UpdateMakeClipDto extends PartialType(CreateMakeClipDto) {}