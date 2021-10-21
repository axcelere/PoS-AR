# -*- coding: utf-8 -*-
from odoo import models,fields, api

class PosOrder(models.Model):
    _inherit = 'pos.order'

    is_tax_free_order = fields.Boolean("Is Tax free order?",default=False)

    @api.model
    def _order_fields(self, ui_order):
        result = super(PosOrder, self)._order_fields(ui_order)
        if 'is_tax_free_order' in ui_order:
            result['is_tax_free_order'] = ui_order['is_tax_free_order']
        return result