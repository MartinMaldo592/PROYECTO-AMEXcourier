namespace MiniERP.Application.Common.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string name, object key) 
        : base($"La entidad '{name}' con ID ({key}) no fue encontrada.") { }
}
