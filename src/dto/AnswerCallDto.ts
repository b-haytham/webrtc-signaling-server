import { IsDefined, IsNotEmpty, IsString } from "class-validator";

export class AnswerCallDto {
    @IsString()
    @IsNotEmpty()
    to: string

    @IsDefined()
    signal: any
}