"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var RoleSchema = new mongoose_1.default.Schema({
    name: { type: String, unique: true, required: true },
    permissions: [{ type: String, required: true }], // Example: ["create_user", "delete_invoice"]
    createdAt: { type: Date, default: Date.now },
});
var Role = mongoose_1.default.model("Role", RoleSchema);
exports.default = Role;
