"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const busboy_1 = __importDefault(require("busboy"));
const sharp_1 = __importDefault(require("sharp"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const imagemin_1 = __importDefault(require("imagemin"));
const imagemin_mozjpeg_1 = __importDefault(require("imagemin-mozjpeg"));
const is_jpg_1 = __importDefault(require("is-jpg"));
const cloud = cloudinary_1.default.v2;
cloud.config({
    // eslint-disable-next-line @typescript-eslint/camelcase
    cloud_name: process.env.cloudinary_cloud_name,
    // eslint-disable-next-line @typescript-eslint/camelcase
    api_key: process.env.cloudinary_api_key,
    // eslint-disable-next-line @typescript-eslint/camelcase
    api_secret: process.env.cloudinary_api_secret,
});
const convertToJpg = async (input) => {
    if (is_jpg_1.default(input)) {
        return input;
    }
    return sharp_1.default(input).jpeg().toBuffer();
};
const optimizeImageBuffer = (buffer) => {
    return imagemin_1.default.buffer(buffer, {
        plugins: [convertToJpg, imagemin_mozjpeg_1.default({ quality: 50 })],
    });
};
const getContentType = (event) => {
    let contentType = event.headers["content-type"];
    if (!contentType) {
        return event.headers["Content-Type"];
    }
    return contentType;
};
exports.processUpload = (event, imageDirectory) => {
    const imageBufferChunks = [];
    return new Promise((resolve, reject) => {
        const uploadStream = cloud.uploader.upload_stream({
            folder: `${imageDirectory.toLowerCase().replace(" ", "_")}/`,
        }, (error, result) => {
            var _a;
            if (error) {
                reject(error);
            }
            else {
                resolve((_a = result) === null || _a === void 0 ? void 0 : _a.public_id);
            }
        });
        const busboy = new busboy_1.default({
            headers: {
                "content-type": getContentType(event),
            },
        });
        busboy.on("file", (fieldname, file, filename) => {
            console.log("File [" + fieldname + "]: filename: " + filename);
            file.on("data", function (data) {
                console.log("File [" + fieldname + "] got " + data.length + " bytes");
                imageBufferChunks.push(data);
            });
            file.on("end", async function () {
                const optimizedImageBuffer = await optimizeImageBuffer(Buffer.concat(imageBufferChunks));
                uploadStream.write(optimizedImageBuffer);
                uploadStream.end();
                console.log("File [" + fieldname + "] Finished");
            });
        });
        busboy.on("error", (error) => reject(`Parse error: ${error}`));
        busboy.write(event.body, "base64");
    });
};
exports.deletePhoto = async (imageUrl) => {
    await cloud.api.delete_resources([imageUrl], (error, result) => {
        if (error)
            throw new Error("Cloudinary unsuccessful - " + error);
        console.log("Cloudinary successfully deleted: ", result);
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvdWRpbmFyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3V0aWxzL2Nsb3VkaW5hcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvREFBNEI7QUFDNUIsa0RBQTBCO0FBQzFCLDREQUFvQztBQUNwQyx3REFBZ0M7QUFDaEMsd0VBQXVDO0FBQ3ZDLG9EQUEyQjtBQUUzQixNQUFNLEtBQUssR0FBRyxvQkFBVSxDQUFDLEVBQUUsQ0FBQztBQUU1QixLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ1Qsd0RBQXdEO0lBQ3hELFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQjtJQUM3Qyx3REFBd0Q7SUFDeEQsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCO0lBQ3ZDLHdEQUF3RDtJQUN4RCxVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUI7Q0FDaEQsQ0FBQyxDQUFDO0FBRUgsTUFBTSxZQUFZLEdBQUcsS0FBSyxFQUFFLEtBQWEsRUFBbUIsRUFBRTtJQUMxRCxJQUFJLGdCQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDZCxPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUNELE9BQU8sZUFBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzFDLENBQUMsQ0FBQztBQUVGLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxNQUFjLEVBQW1CLEVBQUU7SUFDNUQsT0FBTyxrQkFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDM0IsT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFFLDBCQUFPLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNwRCxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7QUFFRixNQUFNLGNBQWMsR0FBRyxDQUFDLEtBQVUsRUFBVSxFQUFFO0lBQzFDLElBQUksV0FBVyxHQUFHLEtBQUssQ0FB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