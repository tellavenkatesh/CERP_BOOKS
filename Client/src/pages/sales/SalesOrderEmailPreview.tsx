import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getSalesOrderById, sendSalesOrder } from "@/api/sales";
import type { SendOrderRequest } from "@/api/sales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

const SalesOrderEmailPreview = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    // const { toast } = useToast(); // Removed hook

    if (!id) return <div>Invalid ID</div>;

    const { data: salesOrder, isLoading } = useQuery({
        queryKey: ["salesOrder", id],
        queryFn: () => getSalesOrderById(id),
    });

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SendOrderRequest>({
        defaultValues: {
            to: "",
            subject: "",
            body: "",
        },
    });

    // Populate form when data is loaded
    useEffect(() => {
        if (salesOrder) {
            // Check if "to" is empty, if so set it
            if (!watch("to")) {
                // We don't have customer email in SalesOrderDto directly, usually it's fetched or part of Customer details.
                // However, the backend DTO currently has `customerId` and `customerName`.
                // Ideally we should have `customerEmail`.
                // Checking if I need to fetch customer details or if I update backend DTO.
                // For now, I will leave it empty or placeholder if not available.
                // Actually, in `GetSalesOrderByIdQuery`, we include Customer.
                // Let's check `SalesOrderDto`. It has `customerName` but not email.
                // I should probably update `SalesOrderDto` to include `customerEmail`.
                // But for now let's assume valid user input.
                setValue("to", "");
            }
            if (!watch("subject")) {
                setValue("subject", `Sales Order #${salesOrder.orderNumber}`);
            }
            if (!watch("body")) {
                const publicLink = `${window.location.origin}/portal/salesorder/public-view-token-placeholder`; // Token is generated on send, so we might not have it yet or we can use a generic link structure if we had the token.
                // Wait, `PublicViewToken` IS in `SalesOrderDto` (I checked `api/sales.ts` line 264 - oh wait that is EstimateDto).
                // Let's check SalesOrder in `api/sales.ts`.
                // SalesOrderDto (lines 17-40) does NOT have `publicViewToken`.
                // But the backend `SalesOrder` entity HAS it.
                // I should probably expose it if I want to show the link.
                // However, the token is generated implicitly on Send if null.
                // So I can't show the EXACT link if it hasn't been sent before.
                // But I can say "A public link will be included".

                setValue("body", `Dear ${salesOrder.customerName},

Please find attached the Sales Order ${salesOrder.orderNumber} for ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(salesOrder.totalAmount)}.

You can view the order online (link will be generated).

Regards,
Seller`);
            }
        }
    }, [salesOrder, setValue, watch]);

    const sendMutation = useMutation({
        mutationFn: (data: SendOrderRequest) => sendSalesOrder(id, data),
        onSuccess: () => {
            toast.success("Email Sent", {
                description: "Sales Order has been emailed successfully.",
            });
            navigate("/sales/salesorders");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Error", {
                description: "Failed to send email.",
            });
        },
    });

    const onSubmit = (data: SendOrderRequest) => {
        sendMutation.mutate(data);
    };

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Email Sales Order</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="to">To</Label>
                            <Input
                                id="to"
                                placeholder="customer@example.com"
                                {...register("to", { required: "Recipient email is required" })}
                            />
                            {errors.to && <p className="text-red-500 text-sm">{errors.to.message}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                {...register("subject", { required: "Subject is required" })}
                            />
                            {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="body">Message</Label>
                            <Textarea
                                id="body"
                                rows={10}
                                {...register("body")}
                            />
                            <p className="text-xs text-gray-500">
                                Note: A public link to the Sales Order will be automatically included in the email.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={sendMutation.isPending}>
                                <Send className="w-4 h-4 mr-2" />
                                {sendMutation.isPending ? "Sending..." : "Send"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SalesOrderEmailPreview;
