import { IsDefined, IsNotEmpty, IsString } from "class-validator";


export class RejectCallEventDto {
    @IsString()
    @IsNotEmpty()
    to: string

    @IsDefined()
    from: {
        socket_id: string
        name: string
    }
}