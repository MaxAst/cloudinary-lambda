"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("./utils/cloudinary");
exports.handler = async function uploadPhoto(event = {}) {
    return cloudinary_1.processUpload(event, "hooli");
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUFtRDtBQUV0QyxRQUFBLE9BQU8sR0FBRyxLQUFLLFVBQVUsV0FBVyxDQUM3QyxRQUFhLEVBQUU7SUFFZixPQUFPLDBCQUFhLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3pDLENBQUMsQ0FBQyJ9