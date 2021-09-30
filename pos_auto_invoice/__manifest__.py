# -*- coding: utf-8 -*-
{
    'name': 'POS Auto Invoice',
    'version': '0.1',
    'author': 'Ing. Gabriela Rivero',
    'license': 'LGPL-3',
    'category': 'Point Of Sale',
    'website': 'www.galup.com.ar',
    'summary': 'Auto Invoice.',
    'depends': ['point_of_sale', 'pos_tax_free_order'],
    'data': [
        'security/ir.model.access.csv',
        'views/payment_method_view.xml',
        'views/pos_auto_invoice.xml',
    ],
    'qweb': [
    ],
    'installable': True,
}
