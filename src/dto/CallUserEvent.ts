import { IsDefined, IsNotEmpty, IsString } from "class-validator"

export class CallUserEventDto {
    @IsString()
    @IsNotEmpty()
    user_to_call: string
    
    @IsDefined()
    signal: any

    @IsDefined()
    from: {
        socket_id: string
        name: string
    }
}