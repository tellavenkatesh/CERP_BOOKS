using CompreoBooks.Application.Features.Reports.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("ledger/{accountId}")]
    public async Task<ActionResult<LedgerReportDto>> GetLedger(Guid accountId, [FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
    {
        return await _mediator.Send(new GetLedgerReportQuery(accountId, fromDate, toDate));
    }

    [HttpGet("trial-balance")]
    public async Task<ActionResult<TrialBalanceDto>> GetTrialBalance([FromQuery] DateTime asOfDate)
    {
        return await _mediator.Send(new GetTrialBalanceQuery(asOfDate));
    }

    [HttpGet("tds")]
    public async Task<ActionResult<List<TdsReportEntryDto>>> GetTdsReport([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
    {
        return await _mediator.Send(new GetTdsReportQuery(fromDate, toDate));
    }

    [HttpGet("tds-payable")]
    public async Task<ActionResult<List<TdsPayableEntryDto>>> GetTdsPayableReport([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
    {
        return await _mediator.Send(new GetTdsPayableReportQuery(fromDate, toDate));
    }

    [HttpGet("profit-loss")]
    public async Task<ActionResult<ProfitAndLossDto>> GetProfitAndLoss([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
    {
        return await _mediator.Send(new GetProfitAndLossQuery(fromDate, toDate));
    }

    [HttpGet("balance-sheet")]
    public async Task<ActionResult<BalanceSheetDto>> GetBalanceSheet([FromQuery] DateTime asOfDate)
    {
        return await _mediator.Send(new GetBalanceSheetQuery(asOfDate));
    }

    [HttpGet("cash-flow")]
    public async Task<ActionResult<CashFlowStatementDto>> GetCashFlowStatement([FromQuery] DateTime fromDate, [FromQuery] DateTime toDate)
    {
        return await _mediator.Send(new GetCashFlowStatementQuery(fromDate, toDate));
    }

    [HttpGet("day-book")]
    public async Task<ActionResult<List<DayBookEntryDto>>> GetDayBook([FromQuery] DateTime date)
    {
        return await _mediator.Send(new GetDayBookQuery(date));
    }

    [HttpGet("aging")]
    public async Task<ActionResult<AgingReportDto>> GetAgingReport([FromQuery] AgingReportType type, [FromQuery] DateTime asOfDate)
    {
        return await _mediator.Send(new GetAgingReportQuery(type, asOfDate));
    }
    [HttpGet("sales-orders")]
    public async Task<ActionResult<List<OrderStatusEntryDto>>> GetSalesOrders()
    {
        return await _mediator.Send(new GetSalesOrderReportQuery());
    }

    [HttpGet("purchase-orders")]
    public async Task<ActionResult<List<OrderStatusEntryDto>>> GetPurchaseOrders()
    {
        return await _mediator.Send(new GetPurchaseOrderReportQuery());
    }

    [HttpGet("grn")]
    public async Task<ActionResult<List<GrnReportEntryDto>>> GetGrn()
    {
        return await _mediator.Send(new GetGrnReportQuery());
    }

    [HttpGet("dashboard-stats")]
    public async Task<ActionResult<DashboardDto>> GetDashboardStats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        return await _mediator.Send(new GetDashboardStatsQuery(startDate, endDate));
    }
}
