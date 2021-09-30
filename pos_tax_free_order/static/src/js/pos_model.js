odoo.define('pos_tax_free_order.models', function (require) {
    "use strict";
        var models = require('point_of_sale.models');
        models.load_fields("pos.order", ["is_tax_free_order"]);

        var _super_order_line = models.Orderline.prototype;
        models.Orderline = models.Orderline.extend({
            get_taxes: function(){
                if (this.order.is_tax_free_order){
                    return [];
                }
                var taxes = _super_order_line.get_taxes.apply(this,arguments);
                return taxes;
            },
            get_applicable_taxes: function(){
                if (this.order.is_tax_free_order){
                    return [];
                }
                var taxes = _super_order_line.get_applicable_taxes.apply(this,arguments);
                return taxes;
            },
            compute_all: function(taxes, price_unit, quantity, currency_rounding, no_map_tax){
                if (this.order.is_tax_free_order){
                    arguments[0] = []
                }
                return _super_order_line.compute_all.apply(this,arguments);
            },
        });


        var _super_order = models.Order.prototype;
        models.Order = models.Order.extend({
            init_from_JSON: function(json) {
                _super_order.init_from_JSON.apply(this,arguments);
                console.log('json.is_tax_free_order', json.is_tax_free_order);
                this.is_tax_free_order=json.is_tax_free_order;
            },
            export_for_printing: function(){
                var json = _super_order.export_for_printing.apply(this,arguments);
                console.log('this.is_tax_free_order',this.is_tax_free_order);
                json.is_tax_free_order=this.is_tax_free_order;

                return json;
            },
            export_as_JSON: function(){
                var json = _super_order.export_as_JSON.apply(this,arguments);
                console.log('this.is_tax_free_order.....',this.is_tax_free_order);
                json.is_tax_free_order = this.is_tax_free_order;

                return json;
            },
        });
    });