'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Leaf, Map, Tractor } from 'lucide-react';
import type { FarmRecord, User } from '@/lib/types';

interface AdminClientProps {
  users: User[];
  farmRecords: FarmRecord[];
}

export function AdminClient({ users, farmRecords }: AdminClientProps) {
  const totalFarmers = users.length;
  const totalArea = users.reduce((sum, f) => sum + (f.totalArea || 0), 0);
  const totalRecords = farmRecords.length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              {totalFarmers}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently registered on the platform
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Area Farmed
            </CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              {totalArea.toLocaleString()}{' '}
              <span className="text-base font-normal">ha</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Total land area being tracked
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Tractor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              {totalRecords}
            </div>
            <p className="text-xs text-muted-foreground">
              Total farm records created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active This Month
            </CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
              {
                new Set(
                  farmRecords
                    .filter(
                      (r) =>
                        new Date(r.harvestDate).getMonth() ===
                        new Date().getMonth()
                    )
                    .map((r) => r.farmerId)
                ).size
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Farmers with recent activity
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Farmer Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer</TableHead>
                <TableHead className="hidden sm:table-cell">Location</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Total Area
                </TableHead>
                <TableHead className="hidden sm:table-cell text-right">
                  Record Count
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={`https://picsum.photos/seed/${farmer.id}/40/40`}
                          alt="Avatar"
                        />
                        <AvatarFallback>
                          {getInitials(farmer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <p className="font-medium">{farmer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {farmer.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{farmer.farmLocation || 'N/A'}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {farmer.totalArea || 0} ha
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    {
                      farmRecords.filter((r) => r.farmerId === farmer.id)
                        .length
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
