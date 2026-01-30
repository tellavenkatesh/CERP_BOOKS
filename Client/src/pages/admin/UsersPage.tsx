import { useEffect, useState } from 'react';
import { getUsers, updateUserRole, toggleUserStatus, createUser, updateUser, resetPassword, type User } from '@/api/users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Checkbox } from "@/components/ui/checkbox"; // Assuming it exists, if not I'll handle failure or use native

const PERMISSIONS_LIST = [
    { id: 'Sales', label: 'Sales Management' },
    { id: 'Purchases', label: 'Purchase Management' },
    { id: 'Banking', label: 'Banking' },
    { id: 'Accounting', label: 'Accounting & Journals' },
    { id: 'Reports', label: 'Reports' },
    { id: 'Admin', label: 'System Admin' }
];

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await updateUserRole(userId, newRole);
            showNotification("User role updated.", "success");
            loadUsers();
        } catch (error) {
            showNotification("Failed to update role.", "error");
        }
    };

    const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
        try {
            await toggleUserStatus(userId, !currentStatus);
            showNotification(`User ${!currentStatus ? 'activated' : 'deactivated'}.`, "success");
            loadUsers();
        } catch (error) {
            showNotification("Failed to update status.", "error");
        }
    };

    // --- Add/Edit User Dialog State ---
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const form = useForm({
        resolver: zodResolver(z.object({
            firstName: z.string().min(1, "First Name is required"),
            lastName: z.string().min(1, "Last Name is required"),
            email: z.string().email("Invalid email"),
            phone: z.string().optional(),
            role: z.string().min(1, "Role is required"),
            permissions: z.array(z.string()).default([]),
            password: z.string().optional(),
        })),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            role: "Viewer",
            permissions: [],
            password: ""
        }
    });

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        form.reset({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || "",
            role: user.role,
            permissions: user.permissions || [],
            password: ""
        });
        setIsDialogOpen(true);
    };

    const handleAddClick = () => {
        setEditingUser(null);
        form.reset({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            role: "Viewer",
            permissions: [],
            password: ""
        });
        setIsDialogOpen(true);
    };

    const onSubmit = async (values: any) => {
        try {
            if (editingUser) {
                await updateUser({
                    userId: editingUser.id,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    phone: values.phone,
                    permissions: values.permissions
                });
                if (editingUser.role !== values.role) {
                    await updateUserRole(editingUser.id, values.role);
                }
                showNotification("User updated successfully", "success");
            } else {
                if (!values.password) {
                    showNotification("Password is required for new users", "error");
                    return;
                }
                await createUser({
                    ...values,
                    phone: values.phone || "",
                    permissions: values.permissions || []
                });
                showNotification("User created successfully", "success");
            }
            setIsDialogOpen(false);
            loadUsers();
        } catch (error) {
            console.error(error);
            showNotification("Operation failed", "error");
        }
    };

    // --- Reset Password State ---
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [resetUserId, setResetUserId] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");

    const openResetDialog = (userId: string) => {
        setResetUserId(userId);
        setNewPassword("");
        setIsResetDialogOpen(true);
    };

    const handleResetPassword = async () => {
        if (!resetUserId || !newPassword) return;
        try {
            await resetPassword(resetUserId, newPassword);
            showNotification("Password reset successfully", "success");
            setIsResetDialogOpen(false);
        } catch (error) {
            showNotification("Failed to reset password", "error");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">User Management</h1>
                <Button onClick={handleAddClick}>+ Add New User</Button>
            </div>

            {notification && (
                <div className={`p-4 mb-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {notification.message}
                </div>
            )}

            {/* Add/Edit User Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input {...form.register("firstName")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input {...form.register("lastName")} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input {...form.register("email")} type="email" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input {...form.register("phone")} placeholder="+91 9876543210" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                                onValueChange={(val) => form.setValue("role", val)}
                                defaultValue={editingUser?.role || "Viewer"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Accountant">Accountant</SelectItem>
                                    <SelectItem value="Data Entry">Data Entry</SelectItem>
                                    <SelectItem value="Viewer">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Permissions (Granular Access Control)</Label>
                            <div className="grid grid-cols-2 gap-2 border p-4 rounded-md">
                                <Controller
                                    control={form.control}
                                    name="permissions"
                                    render={({ field }) => (
                                        <>
                                            {PERMISSIONS_LIST.map((perm) => (
                                                <div key={perm.id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={perm.id}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        checked={field.value?.includes(perm.id)}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            const current = field.value || [];
                                                            if (checked) {
                                                                field.onChange([...current, perm.id]);
                                                            } else {
                                                                field.onChange(current.filter((v: string) => v !== perm.id));
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor={perm.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                        {perm.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                />
                            </div>
                        </div>

                        {!editingUser && (
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input {...form.register("password")} type="password" />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={form.handleSubmit(onSubmit)}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleResetPassword} disabled={!newPassword}>Reset Password</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                                        <div className="text-xs text-muted-foreground">{user.phone}</div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.isActive ? "default" : "destructive"}>
                                            {user.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditClick(user)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleStatusToggle(user.id, user.isActive)}
                                        >
                                            {user.isActive ? "Deactivate" : "Activate"}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => openResetDialog(user.id)}
                                        >
                                            Reset Password
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default UsersPage;
