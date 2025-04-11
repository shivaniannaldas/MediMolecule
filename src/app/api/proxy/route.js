"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
var server_1 = require("next/server");
function POST(req) {
    return __awaiter(this, void 0, void 0, function () {
        var invokeUrl, body, response, responseText, data, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    invokeUrl = "https://health.api.nvidia.com/v1/biology/nvidia/molmim/generate";
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, req.json()];
                case 2:
                    body = _b.sent();
                    console.log("Sending request to NVIDIA API:", {
                        url: invokeUrl,
                        bodyLength: JSON.stringify(body).length,
                        hasApiKey: !!process.env.NVIDIA_API_KEY
                    });
                    console.log("API Key being used:", process.env.NVIDIA_API_KEY);
                    return [4 /*yield*/, fetch(invokeUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer ".concat(process.env.NVIDIA_API_KEY),
                            },
                            body: JSON.stringify(body),
                        })];
                case 3:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("NVIDIA API responded with status ".concat(response.status));
                    }
                    return [4 /*yield*/, response.text()];
                case 4:
                    responseText = _b.sent();
                    console.log("Raw response from NVIDIA API:", responseText);
                    data = void 0;
                    try {
                        data = JSON.parse(responseText);
                    }
                    catch (parseError) {
                        console.error("Error parsing JSON response:", parseError);
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Invalid JSON response from NVIDIA API" }, { status: 502 })];
                    }
                    console.log("Parsed response from NVIDIA API:", {
                        status: response.status,
                        dataLength: JSON.stringify(data).length
                    });
                    return [2 /*return*/, server_1.NextResponse.json(data, { status: 200 })];
                case 5:
                    error_1 = _b.sent();
                    console.error("Detailed error in proxy:", {
                        message: error_1.message,
                        stack: error_1.stack,
                        response: error_1.response ? {
                            status: error_1.response.status,
                            data: error_1.response.data
                        } : null
                    });
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: "Something went wrong",
                            details: error_1.message
                        }, {
                            status: ((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.status) || 500
                        })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
