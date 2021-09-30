odoo.define('pos_tax_free_order.custom', function (require) {
    "use strict";


    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const Registries = require('point_of_sale.Registries');

    class ActionTaxFreeTaxWidget extends PosComponent {
        async onClick() {
            console.log('ActionTaxFreeTaxWidget');
            var order = this.env.pos.get_order();
            console.log('order',order);
            order.is_tax_free_order=true;
            var orderlines = order.get_orderlines();
            $.each(orderlines,function(index){
                var line = orderlines[index];
                line.trigger('change',line);
            })
        }
    }
    class ActionApplyTaxTaxWidget extends PosComponent {
        async onClick() {
            console.log('ActionApplyTaxTaxWidget');
            var order = this.env.pos.get_order();
            console.log('order',order);
            order.is_tax_free_order=false;
            var orderlines = order.get_orderlines();
            $.each(orderlines,function(index){
                var line = orderlines[index];
                line.trigger('change',line);
            })
        }
    }
    ActionTaxFreeTaxWidget.template = 'ActionTaxFreeTaxWidget';
    ProductScreen.addControlButton({
        component: ActionTaxFreeTaxWidget,
        condition: function () {
            return true;
        },
    });
    Registries.Component.add(ActionTaxFreeTaxWidget);

    ActionApplyTaxTaxWidget.template = 'ActionApplyTaxTaxWidget';
    ProductScreen.addControlButton({
        component: ActionApplyTaxTaxWidget,
        condition: function () {
            return true;
        },
    });
    Registries.Component.add(ActionApplyTaxTaxWidget);

    return ActionTaxFreeTaxWidget;



});
