using CompreoBooks.Domain.Entities.Masters;
using CompreoBooks.Domain.Entities.Financial; // For JournalEntryLine cleanup
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CompreoBooks.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        try
        {
            logger.LogInformation("DbSeeder: Starting seed process...");

            // Cleanup: Remove specific legacy/unwanted customers as requested
            var legacyNames = new[] { "XYZ Consultants", "DEMO - Sliced Invoices", "Gokul Constructions" };
            var partiesToDelete = await context.Parties
                .Where(p => legacyNames.Contains(p.Name) || legacyNames.Contains(p.CompanyName))
                .ToListAsync();

            if (partiesToDelete.Any())
            {
                // Cascade Delete: Remove Journal Entry Lines linked to these parties first
                var partyIds = partiesToDelete.Select(p => p.Id).ToList();
                var linkedLines = await context.Set<JournalEntryLine>()
                    .Where(l => l.PartyId.HasValue && partyIds.Contains(l.PartyId.Value))
                    .ToListAsync();
                
                if (linkedLines.Any())
                {
                    context.RemoveRange(linkedLines);
                    logger.LogInformation($"DbSeeder: Deleted {linkedLines.Count} linked Journal Entry Lines.");
                }

                context.Parties.RemoveRange(partiesToDelete);
                await context.SaveChangesAsync();
                logger.LogInformation($"DbSeeder: Deleted {partiesToDelete.Count} legacy customers.");
            }
            
            // Check if our specific seeded data exists, relying on the first unique name
            var seedDataExists = await context.Parties.AnyAsync(p => p.Name == "TechCorp Solutions Pvt Ltd");
            logger.LogInformation($"DbSeeder: Seed data exists? {seedDataExists}");

            var random = new Random();
            var firstNames = new[] { "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen" };
            var lastNames = new[] { "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin" };
            var cities = new[] { "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur" };
            var states = new Dictionary<string, string> 
            { 
                { "Mumbai", "Maharashtra" }, { "Delhi", "Delhi" }, { "Bangalore", "Karnataka" }, 
                { "Hyderabad", "Telangana" }, { "Ahmedabad", "Gujarat" }, { "Chennai", "Tamil Nadu" }, 
                { "Kolkata", "West Bengal" }, { "Surat", "Gujarat" }, { "Pune", "Maharashtra" }, 
                { "Jaipur", "Rajasthan" } 
            };
            var stateCodes = new Dictionary<string, string>
            {
                { "Maharashtra", "MH" }, { "Delhi", "DL" }, { "Karnataka", "KA" },
                { "Telangana", "TG" }, { "Gujarat", "GJ" }, { "Tamil Nadu", "TN" },
                { "West Bengal", "WB" }, { "Rajasthan", "RJ" }
            };

            // 1. Seed Customers if needed
            var customerCount = await context.Parties.CountAsync(p => p.Type == 0);
            if (customerCount < 10)
            {
                logger.LogInformation($"DbSeeder: Found only {customerCount} customers. Seeding 100 random customers...");
                var newCustomers = new List<Party>();

                for (int i = 0; i < 100; i++)
                {
                    var fn = firstNames[random.Next(firstNames.Length)];
                    var ln = lastNames[random.Next(lastNames.Length)];
                    var city = cities[random.Next(cities.Length)];
                    var state = states[city];
                    var stateCode = stateCodes.ContainsKey(state) ? stateCodes[state] : "OS";
                    
                    var isBusiness = random.Next(2) == 0;
                    var companyName = isBusiness ? $"{ln} & {fn} Associates" : "";
                    
                    newCustomers.Add(new Party
                    {
                        Name = isBusiness ? companyName : $"{fn} {ln}",
                        DisplayName = isBusiness ? companyName : $"{fn} {ln}",
                        Type = 0, // Customer
                        CompanyName = companyName,
                        Salutation = random.Next(2) == 0 ? "Mr." : "Ms.",
                        FirstName = fn,
                        LastName = ln,
                        ContactPerson = $"{fn} {ln}",
                        Email = $"{fn.ToLower()}.{ln.ToLower()}{random.Next(100, 999)}@example.com",
                        Phone = $"{random.Next(700, 999)}{random.Next(1000000, 9999999)}",
                        Mobile = $"{random.Next(700, 999)}{random.Next(1000000, 9999999)}",
                        Website = isBusiness ? $"www.{ln.ToLower()}{fn.ToLower()}.com" : "",
                        
                        BillingAttention = "Accounts Dept",
                        BillingAddress = $"{random.Next(1, 999)} Main St, {city}",
                        BillingStreet2 = $"Suite {random.Next(100, 500)}",
                        BillingCity = city,
                        BillingState = state,
                        BillingCountry = "India",
                        BillingPincode = $"{random.Next(100000, 999999)}",
                        BillingPhone = $"{random.Next(700, 999)}{random.Next(1000000, 9999999)}",
                        BillingFax = "",

                        ShippingAttention = "Logistics Dept",
                        ShippingAddress = $"{random.Next(1, 999)} Main St, {city}",
                        ShippingStreet2 = $"Suite {random.Next(100, 500)}",
                        ShippingCity = city,
                        ShippingState = state,
                        ShippingCountry = "India",
                        ShippingPincode = $"{random.Next(100000, 999999)}",
                        ShippingPhone = $"{random.Next(700, 999)}{random.Next(1000000, 9999999)}",
                        
                        GstTreatment = isBusiness ? "registered_business_regular" : "consumer",
                        PlaceOfSupply = stateCode,
                        GstIn = isBusiness ? $"{random.Next(10, 30)}AAAAA{random.Next(1000, 9999)}A1Z5" : "",
                        PanNumber = $"ABCDE{random.Next(1000, 9999)}F",
                        TaxPreference = "Taxable",
                        Currency = "INR",
                        
                        CreditLimit = random.Next(10000, 200000),
                        OpeningBalance = random.Next(0, 5000),
                        IsActive = true,
                        
                        SkypeName = $"{fn}.{ln}",
                        Twitter = $"@{fn}{ln}",
                        Facebook = $"{fn}{ln}",
                        Designation = isBusiness ? "Manager" : "Owner",
                        Department = "Sales",
                        Notes = "Auto-generated random customer"
                    });
                }
                context.Parties.AddRange(newCustomers);
                await context.SaveChangesAsync();
                logger.LogInformation($"DbSeeder: Successfully seeded {newCustomers.Count} customers.");
            }

            // 2. Seed Vendors if needed
            var vendorCount = await context.Parties.CountAsync(p => p.Type == 1);
            if (vendorCount < 10)
            {
                logger.LogInformation($"DbSeeder: Found only {vendorCount} vendors. Seeding 100 random vendors...");
                var newVendors = new List<Party>();

                for (int i = 0; i < 100; i++)
                {
                    var fn = firstNames[random.Next(firstNames.Length)];
                    var ln = lastNames[random.Next(lastNames.Length)];
                    var city = cities[random.Next(cities.Length)];
                    var state = states[city];
                    var stateCode = stateCodes.ContainsKey(state) ? stateCodes[state] : "OS";
                    
                    var companyName = $"{ln} Enterprises";
                    
                    newVendors.Add(new Party
                    {
                        Name = companyName,
                        DisplayName = companyName,
                        Type = 1, // Vendor
                        CompanyName = companyName,
                        Salutation = random.Next(2) == 0 ? "Mr." : "Ms.",
                        FirstName = fn,
                        LastName = ln,
                        ContactPerson = $"{fn} {ln}",
                        Email = $"support@{ln.ToLower()}enterprises.com",
                        Phone = $"{random.Next(700, 999)}{random.Next(1000000, 9999999)}",
                        Mobile = $"{random.Next(700, 999)}{random.Next(1000000, 9999999)}",
                        Website = $"www.{ln.ToLower()}enterprises.com",
                        
                        BillingAttention = "Billing Dept",
                        BillingAddress = $"{random.Next(1, 999)} Industrial Area, {city}",
                        BillingStreet2 = $"Building {random.Next(1, 20)}",
                        BillingCity = city,
                        BillingState = state,
                        BillingCountry = "India",
                        BillingPincode = $"{random.Next(100000, 999999)}",
                        BillingPhone = $"{random.Next(700, 999)}{random.Next(1000000, 9999999)}",
                        BillingFax = "",

                        ShippingAttention = "dispatch Dept",
                        ShippingAddress = $"{random.Next(1, 999)} Industrial Area, {city}",
                        ShippingStreet2 = $"Building {random.Next(1, 20)}",
                        ShippingCity = city,
                        ShippingState = state,
                        ShippingCountry = "India",
                        ShippingPincode = $"{random.Next(100000, 999999)}",
                        ShippingPhone = $"{random.Next(700, 999)}{random.Next(1000000, 9999999)}",
                        
                        GstTreatment = "registered_business_regular",
                        PlaceOfSupply = stateCode,
                        GstIn = $"{random.Next(10, 30)}ABCDE{random.Next(1000, 9999)}A1Z5",
                        PanNumber = $"ABCDE{random.Next(1000, 9999)}F",
                        TaxPreference = "Taxable",
                        Currency = "INR",
                        
                        CreditLimit = random.Next(50000, 500000),
                        OpeningBalance = random.Next(0, 10000),
                        IsActive = true,
                        
                        SkypeName = $"{fn}.vendor",
                        Twitter = $"@{ln}Ent",
                        Facebook = $"{ln}Enterprises",
                        Designation = "Sales Manager",
                        Department = "Sales",
                        Notes = "Auto-generated random vendor"
                    });
                }
                context.Parties.AddRange(newVendors);
                await context.SaveChangesAsync();
                logger.LogInformation($"DbSeeder: Successfully seeded {newVendors.Count} vendors.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }
}
