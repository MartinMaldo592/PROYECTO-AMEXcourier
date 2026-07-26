using MiniERP.Application.Common.Exceptions;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Application.DTOs;

namespace MiniERP.Application.UseCases.Courier;

public class TransferPackageToLinceUseCase(
    IPackageRepository packageRepository,
    IUnitOfWork unitOfWork)
{
    public async Task<int> ExecuteAsync(TransferToLinceRequest request, CancellationToken cancellationToken = default)
    {
        if (request.PackageIds == null || request.PackageIds.Count == 0)
            throw new ValidationException("Debe seleccionar al menos un paquete para trasladar al almacén de Lince.");

        await unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            int count = 0;
            foreach (var packageId in request.PackageIds)
            {
                var package = await packageRepository.GetByIdAsync(packageId, cancellationToken)
                    ?? throw new NotFoundException("Package", packageId);

                // Transferir de Almacén Tib Courier Tingo María ➔ Almacén Amex Lince
                package.TransferToAmexLince();
                packageRepository.Update(package);
                count++;
            }

            await unitOfWork.SaveChangesAsync(cancellationToken);
            await unitOfWork.CommitTransactionAsync(cancellationToken);

            return count;
        }
        catch
        {
            await unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
