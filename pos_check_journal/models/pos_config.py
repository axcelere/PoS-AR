# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import UserError

class PosConfig(models.Model):
    _inherit = 'pos.config'

    def _check_journals(self, vals):
        journal_obj = self.env['account.journal']
        print ('vals', vals)
        if 'invoice_journal_id' in vals.keys():
            if not journal_obj.browse(vals['invoice_journal_id']).l10n_latam_use_documents:
                raise UserError('El diario de facturación debe usar documentos.')
        if 'journal_id' in vals.keys():
            if journal_obj.browse(vals['journal_id']).l10n_latam_use_documents:
                raise UserError('El diario de ventas no debe usar documentos.')


    def write(self, vals):
        self.sudo()._check_journals(vals)
        return super(PosConfig, self).write(vals)

    @api.model
    def create(self, vals):
        self.sudo()._check_journals(vals)
        return super(PosConfig, self).create(vals)

