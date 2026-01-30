
export const exportToCSV = (data: any[], filename: string = "report.csv") => {
    if (!data || data.length === 0) {
        alert("No data to export");
        return;
    }

    // Extract headers
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(","), // Header row
        ...data.map(row => headers.map(header => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            const escaped = typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            return escaped;
        }).join(","))
    ].join("\n");

    // Create Blob and Link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
