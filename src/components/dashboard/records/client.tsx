"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FarmRecord, FarmRecordWithProfit } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore } from "@/firebase";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  cropType: z.string().min(1, "Crop type is required"),
  area: z.coerce.number().positive("Area must be positive"),
  plantingDate: z.string().min(1, "Planting date is required"),
  harvestDate: z.string().min(1, "Harvest date is required"),
  expenses: z.coerce.number().positive("Expenses must be positive"),
  harvestQuantity: z.coerce.number().positive("Harvest quantity must be positive"),
  marketPrice: z.coerce.number().positive("Market price must be positive"),
  inputsUsed: z.string().min(1, "Inputs used are required"),
});

export function RecordsClient({
  records,
}: {
  records: FarmRecordWithProfit[];
}) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropType: "",
      area: 0,
      plantingDate: "",
      harvestDate: "",
      expenses: 0,
      harvestQuantity: 0,
      marketPrice: 0,
      inputsUsed: "",
    },
  });

  const formatCurrency = (amount: number) =>
    `₱ ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a record.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const newRecord: FarmRecord = {
        ...values,
        farmerId: user.uid,
      };
      await addDoc(collection(firestore, "farmRecords"), newRecord);
      toast({
        title: "Success",
        description: "Farm record added successfully.",
      });
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error adding record",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteRecord(recordId: string) {
    if (!user) return;
    const docRef = doc(firestore, "farmRecords", recordId);
    try {
      await deleteDoc(docRef);
      toast({
        title: "Success",
        description: "Record deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting record",
        description: error.message,
        variant: "destructive",
      });
    }
  }


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Farm Records</CardTitle>
            <CardDescription>
              Manage and view all your farm records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop</TableHead>
                  <TableHead>Planting Date</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Expenses
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Profit</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.cropType}
                    </TableCell>
                    <TableCell>
                      {new Date(record.plantingDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatCurrency(record.expenses)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatCurrency(record.profit)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteRecord(record.id)}
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>1-{records.length}</strong> of{" "}
              <strong>{records.length}</strong> records
            </div>
          </CardFooter>
        </Card>
      </div>

      <div>
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline">Add New Record</CardTitle>
                <CardDescription>
                  Fill out the form to add a new farm record.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cropType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crop Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Rice" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area (ha)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 2.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plantingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Planting Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="harvestDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harvest Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expenses (₱)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 15000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="harvestQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harvest Qty</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 120" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                    control={form.control}
                    name="marketPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Market Price (per unit)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 1200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                  control={form.control}
                  name="inputsUsed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inputs Used</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List fertilizers, pesticides, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Record"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
