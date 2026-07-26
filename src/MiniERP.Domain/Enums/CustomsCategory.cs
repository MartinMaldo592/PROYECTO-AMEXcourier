namespace MiniERP.Domain.Enums;

public enum CustomsCategory
{
    CategoryB_Under200 = 1, // Hasta 200 USD: Exento de Impuestos SUNAT
    CategoryC_Over200 = 2   // Mayor a 200 USD: Aplica Ad-Valorem (4%) e IGV/IPM (18%)
}
