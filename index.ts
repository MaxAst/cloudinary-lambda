import { processUpload } from "./utils/cloudinary";

export const handler = async function uploadPhoto(
    event: any = {}
): Promise<any> {
    return processUpload(event, "hooli");
};
