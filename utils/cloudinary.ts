import Busboy from "busboy";
import sharp from "sharp";
import cloudinary from "cloudinary";
import imagemin from "imagemin";
import mozjpeg from "imagemin-mozjpeg";
import isJpg from "is-jpg";

const cloud = cloudinary.v2;

cloud.config({
    // eslint-disable-next-line @typescript-eslint/camelcase
    cloud_name: process.env.cloudinary_cloud_name,
    // eslint-disable-next-line @typescript-eslint/camelcase
    api_key: process.env.cloudinary_api_key,
    // eslint-disable-next-line @typescript-eslint/camelcase
    api_secret: process.env.cloudinary_api_secret,
});

const convertToJpg = async (input: Buffer): Promise<Buffer> => {
    if (isJpg(input)) {
        return input;
    }
    return sharp(input).jpeg().toBuffer();
};

const optimizeImageBuffer = (buffer: Buffer): Promise<Buffer> => {
    return imagemin.buffer(buffer, {
        plugins: [convertToJpg, mozjpeg({ quality: 50 })],
    });
};

const getContentType = (event: any): string => {
    let contentType = event.headers["content-type"];
    if (!contentType) {
        return event.headers["Content-Type"];
    }
    return contentType;
};

export const processUpload = (
    event: any,
    imageDirectory: string
): Promise<string> => {
    const imageBufferChunks: Array<Buffer> = [];

    return new Promise((resolve, reject) => {
        const uploadStream = cloud.uploader.upload_stream(
            {
                folder: `${imageDirectory.toLowerCase().replace(" ", "_")}/`,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result?.public_id);
                }
            }
        );

        const busboy = new Busboy({
            headers: {
                "content-type": getContentType(event),
            },
        });

        busboy.on(
            "file",
            (
                fieldname: string,
                file: NodeJS.ReadableStream,
                filename: string
            ) => {
                console.log("File [" + fieldname + "]: filename: " + filename);
                file.on("data", function (data) {
                    console.log(
                        "File [" + fieldname + "] got " + data.length + " bytes"
                    );
                    imageBufferChunks.push(data);
                });
                file.on("end", async function () {
                    const optimizedImageBuffer = await optimizeImageBuffer(
                        Buffer.concat(imageBufferChunks)
                    );
                    uploadStream.write(optimizedImageBuffer);
                    uploadStream.end();
                    console.log("File [" + fieldname + "] Finished");
                });
            }
        );

        busboy.on("error", (error: any): void =>
            reject(`Parse error: ${error}`)
        );

        busboy.write(event.body, "base64");
    });
};

export const deletePhoto = async (imageUrl: string): Promise<void> => {
    await cloud.api.delete_resources([imageUrl], (error, result) => {
        if (error) throw new Error("Cloudinary unsuccessful - " + error);
        console.log("Cloudinary successfully deleted: ", result);
    });
};
