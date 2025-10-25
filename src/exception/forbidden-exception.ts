export class ForbiddenException extends Error {

    private statusCode;
    private isCustomError;

    constructor(private customMessage: string, private errors?: string[]) {
        super(customMessage);
        this.errors = errors;
        this.statusCode = 401;
        this.isCustomError = true;
    }

}