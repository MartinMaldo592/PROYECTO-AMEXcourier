using Microsoft.AspNetCore.Mvc;
using MiniERP.Application.Common.Exceptions;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Application.DTOs;
using MiniERP.Domain.Entities.SD;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class CustomersController(
    ICustomerRepository customerRepository,
    IUnitOfWork unitOfWork,
    IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CustomerCourierResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var customers = await customerRepository.GetAllAsync(cancellationToken);
        var result = customers.Select(c => new CustomerCourierResponse(
            c.Id,
            c.TaxId,
            c.Name,
            c.Email,
            c.LockerCode,
            c.Phone,
            c.DeliveryAddress,
            c.Department,
            c.Province,
            c.District,
            c.PreferredCarrier,
            c.DestinationAgency,
            c.DniFrontUrl,
            c.DniBackUrl,
            c.IsActive,
            c.CreatedAt
        )).ToList();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerCourierResponse>> Create([FromBody] CreateCustomerCourierRequest request, CancellationToken cancellationToken)
    {
        var allCustomers = await customerRepository.GetAllAsync(cancellationToken);
        var lockerNumber = 1001 + allCustomers.Count;
        var lockerCode = $"AMEX-PER-{lockerNumber}";

        var customer = new Customer(
            request.TaxId,
            request.Name,
            request.Email,
            lockerCode,
            request.Phone ?? "",
            request.DeliveryAddress ?? "",
            request.Department ?? "LIMA",
            request.Province ?? "LIMA",
            request.District ?? "LINCE",
            request.PreferredCarrier ?? "SHALOM",
            request.DestinationAgency ?? "ENTREGA EN ALMACEN LINCE"
        );

        await customerRepository.AddAsync(customer, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new CustomerCourierResponse(
            customer.Id,
            customer.TaxId,
            customer.Name,
            customer.Email,
            customer.LockerCode,
            customer.Phone,
            customer.DeliveryAddress,
            customer.Department,
            customer.Province,
            customer.District,
            customer.PreferredCarrier,
            customer.DestinationAgency,
            customer.DniFrontUrl,
            customer.DniBackUrl,
            customer.IsActive,
            customer.CreatedAt
        );

        return CreatedAtAction(nameof(GetAll), new { id = customer.Id }, response);
    }

    [HttpPost("{customerId}/upload-dni")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<CustomerCourierResponse>> UploadDni(
        Guid customerId,
        IFormFile? frontFile,
        IFormFile? backFile,
        CancellationToken cancellationToken)
    {
        var customer = await customerRepository.GetByIdAsync(customerId, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), customerId);

        var uploadsFolder = Path.Combine(environment.WebRootPath, "uploads", "dnis");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        string? frontUrl = customer.DniFrontUrl;
        string? backUrl = customer.DniBackUrl;

        if (frontFile != null && frontFile.Length > 0)
        {
            var frontFileName = $"{customer.LockerCode}_DNI_FRONT{Path.GetExtension(frontFile.FileName)}";
            var frontPath = Path.Combine(uploadsFolder, frontFileName);
            using (var stream = new FileStream(frontPath, FileMode.Create))
            {
                await frontFile.CopyToAsync(stream, cancellationToken);
            }
            frontUrl = $"/uploads/dnis/{frontFileName}";
        }

        if (backFile != null && backFile.Length > 0)
        {
            var backFileName = $"{customer.LockerCode}_DNI_BACK{Path.GetExtension(backFile.FileName)}";
            var backPath = Path.Combine(uploadsFolder, backFileName);
            using (var stream = new FileStream(backPath, FileMode.Create))
            {
                await backFile.CopyToAsync(stream, cancellationToken);
            }
            backUrl = $"/uploads/dnis/{backFileName}";
        }

        customer.UpdateDniUrls(frontUrl ?? "", backUrl ?? "");
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new CustomerCourierResponse(
            customer.Id,
            customer.TaxId,
            customer.Name,
            customer.Email,
            customer.LockerCode,
            customer.Phone,
            customer.DeliveryAddress,
            customer.Department,
            customer.Province,
            customer.District,
            customer.PreferredCarrier,
            customer.DestinationAgency,
            customer.DniFrontUrl,
            customer.DniBackUrl,
            customer.IsActive,
            customer.CreatedAt
        );

        return Ok(response);
    }
}
