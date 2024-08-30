import { connect, MongooseError } from 'mongoose';
import { DB_URI } from '../config';

const connectToDatabase = async (): Promise<void> => {
    return new Promise<void>(async (resolve: () => void, reject: (error: any) => void) => {
        try {
            await connect(DB_URI);
            resolve();
        } catch (error: any) {
            reject(error);
        }
    });
};

export default connectToDatabase;