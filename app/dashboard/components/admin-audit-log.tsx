'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/config';
import { Loader2, ShieldAlert, Activity, Key, Search, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';

interface AuditLog {
  id: string;
  timestampWib: string;
  level: string;
  category: string;
  userEmail: string | null;
  userRole: string | null;
  ipAddress: string | null;
  action: string;
  method: string | null;
  path: string | null;
  statusCode: number | null;
}

export function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [level, setLevel] = useState('all');
  const [category, setCategory] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(level !== 'all' && { level }),
        ...(category !== 'all' && { category })
      });

      const res = await fetch(`${API_BASE_URL}/audit?${query.toString()}`, {
        credentials: "include"
      });

      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data.data);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      toast.error('Error', {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, level, category]);

  const getLevelBadge = (level: string) => {
    switch(level) {
      case 'ERROR': return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 border border-red-200">ERROR</span>;
      case 'WARN': return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">WARN</span>;
      default: return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">INFO</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'SECURITY': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'AUTH': return <Key className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-gray-800">Keamanan & Audit Log</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Sistem logging keamanan dan mutasi data waktu-nyata</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={level} onValueChange={(val) => setLevel(val || 'all')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Level</SelectItem>
                <SelectItem value="INFO">INFO</SelectItem>
                <SelectItem value="WARN">WARN</SelectItem>
                <SelectItem value="ERROR">ERROR</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={(val) => setCategory(val || 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="SECURITY">SECURITY</SelectItem>
                <SelectItem value="AUTH">AUTH</SelectItem>
                <SelectItem value="MUTATION">MUTATION</SelectItem>
                <SelectItem value="SYSTEM">SYSTEM</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => fetchLogs()} disabled={loading}>
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold">Waktu</th>
                <th className="px-6 py-4 font-semibold">Level / Kategori</th>
                <th className="px-6 py-4 font-semibold">Pengguna / IP</th>
                <th className="px-6 py-4 font-semibold">Tindakan</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Memuat logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada log yang ditemukan.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-xs">
                      {log.timestampWib}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getLevelBadge(log.level)}
                        <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                          {getCategoryIcon(log.category)}
                          {log.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{log.userEmail || 'Anonymous'}</span>
                        <span className="text-xs text-gray-500">{log.userRole ? `Role: ${log.userRole}` : ''} | IP: {log.ipAddress || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">{log.action}</span>
                        <span className="text-xs text-gray-500 font-mono mt-0.5">{log.method} {log.path}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.statusCode ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${log.statusCode >= 400 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {log.statusCode}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
