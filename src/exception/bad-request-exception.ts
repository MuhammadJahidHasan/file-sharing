export class BadRequestException extends Error {

    private statusCode;
    private isCustomError;

    constructor(private customMessage: string, private errors?: string[]) {
        super(customMessage);
        this.errors = errors;
        this.statusCode = 400;
        this.isCustomError = true;
    }

}