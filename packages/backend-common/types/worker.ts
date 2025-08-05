export interface CalculatedOdds {
    topicId: string;
    options: {
        optionId: string;
        amount: number;
        currentPayout: number;
    }[];
    timestamp: Date;
}