
export class NotFoundException extends Error {

    private statusCode;
    private isCustomError;

    constructor(private customMessage: string, private errors?: string[]) {
        super(customMessage);
        this.customMessage = customMessage;
        this.errors = errors;
        this.statusCode = 404;
        this.isCustomError = true;
    }

}