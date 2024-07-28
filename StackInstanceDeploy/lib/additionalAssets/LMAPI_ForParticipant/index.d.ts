export declare const handler: (event: import("aws-lambda").APIGatewayProxyEvent) => Promise<{
    statusCode: number;
    Headers: {
        "Access-Control-Allow-Headers": string;
        "Access-Control-Allow-Origin": string;
        "Access-Control-Allow-Methods": string;
    };
    body: string;
    headers?: undefined;
} | {
    statusCode: number;
    headers: {
        "Access-Control-Allow-Headers": string;
        "Access-Control-Allow-Origin": string;
        "Access-Control-Allow-Methods": string;
    };
    body: string;
    Headers?: undefined;
}>;
