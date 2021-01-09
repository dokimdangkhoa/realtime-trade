const ServiceBase = require("../helpers/ServicesBase").ServiceBase
const Response = require("../helpers/SevicesResponse")
const SymbolModel = require("../models/bot_stratery").Symbol
const FieldPropertiesModel = require("../models/bot_stratery").FieldProperties
const GruopModel = require("../models/bot_stratery").Gruop
const mongoose = require("mongoose")
class BotSettingService extends ServiceBase {
    constructor(model) {
        super(model);
    }
    async create_Group(body) {
        try {
            let item = await GruopModel.create({ name: body.name })
            if (item) {
                return new Response(false, item);
            } else {
                return new Response(true, {}, 'Something wrong happened');
            }
        } catch (error) {
            return new Response(true, error, "Error");
        }
    }
    async getAll_gruop() {
        try {
            let item = await GruopModel.find({})
            return new Response(false, item);
        } catch (error) {
            return new Response(true, error, "Error");
        }
    }

    async create_symbol(body) {
        try {
            let item = await SymbolModel.create({ name: body.name })
            if (item) {
                return new Response(false, item);
            } else {
                return new Response(true, {}, 'Something wrong happened');
            }
        } catch (error) {
            return new Response(true, error, "Error");
        }
    }
    async getAll_symbol() {
        try {
            let item = await SymbolModel.find({})
            return new Response(false, item);
        } catch (error) {
            return new Response(true, error, "Error");
        }
    }

    async getAll_fields() {
        try {
            let item = await FieldPropertiesModel.find({})
            return new Response(false, item);
        } catch (error) {
            return new Response(true, error, "Error");
        }
    }

    async create_fields(body) {
        try {
            let item = await FieldPropertiesModel.create(body)
            if (item) {
                return new Response(false, item);
            } else {
                return new Response(true, {}, 'Something wrong happened');
            }
        } catch (error) {
            return new Response(true, error, "Error");
        }
    }

    async create_setting(body) {
        try {
            let check_exist = await this.model.aggregate([{
                $match: {
                    // "gruop_id": mongoose.Types.ObjectId(body.gruop_id),
                    "strategy_id": mongoose.Types.ObjectId(body.strategy_id),
                    "symbol_id": mongoose.Types.ObjectId(body.symbol_id)
                }
            }, {
                $lookup: {
                    from: "Symbol",
                    localField: "symbol_id",
                    foreignField: "_id",
                    as: "symbol_id"
                }
            }, {
                $lookup: {
                    from: "BotStratery",
                    localField: "strategy_id",
                    foreignField: "_id",
                    as: "stratery"
                }
            }, {
                $project: {
                    symbol: {
                        $arrayElemAt: [
                            "$symbol_id.name",
                            0
                        ]
                    },
                    stratery: {
                        $arrayElemAt: [
                            "$stratery.name",
                            0
                        ]
                    }
                }
            }])
            if (check_exist.length > 0) {
                return new Response(true, {}, `symbol ${check_exist[0].symbol} của chiến lược {${check_exist[0].stratery}} đã được tạo`);
            }
            let item = await FieldPropertiesModel.find({})
            let query = {
                "gruop_id": body.gruop_id,
                "strategy_id": body.strategy_id,
                "symbol_id": body.symbol_id,
                "fields": [
                ]
            }
            for (let index = 0; index < item.length; index++) {
                const element = item[index];
                const index_field = body.fields.findIndex(v => v.field_id == element._id)
                query.fields.push({
                    field_id: element._id,
                    value: index_field > -1 ? body.fields[index_field].value : element.default_value,
                })
            }
            let result = await this.model.create(query)
            if (result) {
                return new Response(false, result);
            } else {
                return new Response(true, {}, 'Something wrong happened');
            }
        } catch (error) {
            return new Response(true, error, "Error");
        }
    }

    async get_setting(stratery_id, symbol_id) {
        let result = await this.model.aggregate([{
            $match: {
                "strategy_id": mongoose.Types.ObjectId(stratery_id),
                "symbol_id": mongoose.Types.ObjectId(symbol_id)
            }
        }, {
            $lookup: {
                from: "Symbol",
                localField: "symbol_id",
                foreignField: "_id",
                as: "symbol_id"
            }
        }, {
            $lookup: {
                from: "BotStratery",
                localField: "strategy_id",
                foreignField: "_id",
                as: "stratery"
            }
        }, { $lookup: { from: "FieldProperties", localField: "fields.field_id", foreignField: "_id", as: "fields" } }, {
            $project: {
                symbol: {
                    $arrayElemAt: [
                        "$symbol_id.name",
                        0
                    ]
                },
                stratery: {
                    $arrayElemAt: [
                        "$stratery.name",
                        0
                    ]
                },
                fields: 1
            }
        }]);
        if (result.length > 0) {
            return new Response(false, result[0]);
        } else {
            return new Response(true, {}, 'Something wrong happened');
        }
    }

    async create_setting(body) {
        try {
            let item = await FieldPropertiesModel.find({})
            let query = {
                "strategy_id": body.strategy_id,
                "symbol_id": body.symbol_id,
                "fields": [
                ]
            }
            for (let index = 0; index < item.length; index++) {
                const element = item[index];
                const index_field = body.fields.findIndex(v => v.field_id == element._id)
                query.fields.push({
                    field_id: element._id,
                    value: index_field > -1 ? body.fields[index_field].value : element.default_value,
                })
            }
            let result = await this.model.updateOne({
                "strategy_id": body.strategy_id,
                "symbol_id": body.symbol_id,
            }, query)
            if (result) {
                return new Response(false, result);
            } else {
                return new Response(true, {}, 'Something wrong happened');
            }
        } catch (error) {
            return new Response(true, error, "Error");
        }
    }

}

module.exports = { BotSettingService }