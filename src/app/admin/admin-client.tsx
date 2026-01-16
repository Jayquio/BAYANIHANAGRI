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

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFarmers}</div>
            <p className="text-xs text-muted-foreground">
              Currently registered on the platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Area Farmed
            </CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalArea.toLocaleString()} <span className="text-base">ha</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Total land area being tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Tractor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Total farm records created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active This Month
            </CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
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

      {/* ===== FARMER DIRECTORY ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Farmer Directory</CardTitle>
        </CardHeader>

        <CardContent>

          {/* ===== MOBILE VIEW ===== */}
          <div className="space-y-4 md:hidden">
            {users.map((farmer) => (
              <div key={farmer.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://picsum.photos/seed/${farmer.id}/40/40`}
                    />
                    <AvatarFallback>
                      {getInitials(farmer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{farmer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {farmer.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p>{farmer.farmLocation || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Area</p>
                    <p>{farmer.totalArea || 0} ha</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Records</p>
                    <p>
                      {
                        farmRecords.filter(
                          (r) => r.farmerId === farmer.id
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ===== DESKTOP VIEW ===== */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Total Area</TableHead>
                  <TableHead className="text-right">Record Count</TableHead>
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
                          />
                          <AvatarFallback>
                            {getInitials(farmer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{farmer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {farmer.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{farmer.farmLocation || 'N/A'}</TableCell>
                    <TableCell>{farmer.totalArea || 0} ha</TableCell>
                    <TableCell className="text-right">
                      {
                        farmRecords.filter(
                          (r) => r.farmerId === farmer.id
                        ).length
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
