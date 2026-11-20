using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;

namespace testtttt88.Controllers;

[Route("api/app/tep-tin")]
public class TepTinController : testtttt88Controller
{
    private readonly IWebHostEnvironment _environment;
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB

    public TepTinController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UploadResultDto>> UploadAsync(IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            throw new UserFriendlyException("Vui lòng chọn một tệp hình ảnh để tải lên!");
        }

        if (file.Length > MaxFileSize)
        {
            throw new UserFriendlyException("Dung lượng tệp vượt quá giới hạn cho phép (tối đa 10MB)!");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
        {
            throw new UserFriendlyException($"Định dạng tệp không được hỗ trợ ({extension}). Chỉ chấp nhận: .jpg, .jpeg, .png, .webp, .gif");
        }

        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");
        }

        var uploadDir = Path.Combine(webRoot, "uploads", "images");
        if (!Directory.Exists(uploadDir))
        {
            Directory.CreateDirectory(uploadDir);
        }

        var uniqueFileName = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadDir, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var relativeUrl = $"/uploads/images/{uniqueFileName}";
        var fullUrl = $"{baseUrl}{relativeUrl}";

        return Ok(new UploadResultDto
        {
            Url = fullUrl,
            RelativeUrl = relativeUrl,
            FileName = uniqueFileName,
            OriginalFileName = file.FileName,
            FileSize = file.Length
        });
    }
}

public class UploadResultDto
{
    public string Url { get; set; } = string.Empty;
    public string RelativeUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
}
