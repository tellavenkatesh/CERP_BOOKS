using System;


namespace CompreoBooks.Application.Features.Sales.DTOs
{
    public class EstimateVersionDto
    {
        public Guid Id { get; set; }
        public Guid EstimateId { get; set; }
        public int VersionNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string SnapshotJson { get; set; }
    }
}
