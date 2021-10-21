# -*- coding: utf-8 -*-

from odoo import api, fields, models, tools, _
from odoo.exceptions import UserError,ValidationError
from odoo.tools import float_is_zero, pycompat
from odoo.addons import decimal_precision as dp
from datetime import date
import os
import base64
from collections import defaultdict

class PosPaymentMethod(models.Model):
    _inherit = 'pos.payment.method'

    line_ids = fields.One2many('pos.payment.method.line', 'payment_method_id')

    def _is_write_forbidden(self, fields):
        return False

class PosPaymentMethod(models.Model):
    _name = 'pos.payment.method.line'

    payment_method_id = fields.Many2one('pos.payment.method')
    pos_config_id = fields.Many2one('pos.config', 'TPV')
    type = fields.Selection([
        ('manual', 'Manual'),
        ('cta_cte', 'Cta. Cte.')], 'Tipo')
    invoice_amount = fields.Float('Invoice Amount', default=0)

