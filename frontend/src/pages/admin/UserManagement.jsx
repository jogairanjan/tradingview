import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import { mockUsers } from '../../utils/mockData';
import DataTable from '../../components/ui/DataTable';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    adminApi.users({ page, limit: perPage, search })
      .then((res) => setUsers(res.data.users || res.data))
      .catch(() => setUsers(mockUsers))
      .finally(() => setLoading(false));
  }, [page, search]);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'plan', label: 'Plan', render: (r) => <Badge variant="brand">{r.plan}</Badge> },
    { key: 'role', label: 'Role', render: (r) => <Badge variant={r.role === 'admin' ? 'warning' : 'default'}>{r.role}</Badge> },
    { key: 'status', label: 'Status', render: (r) => <Badge variant={r.status === 'active' ? 'buy' : 'sell'}>{r.status}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={async (e) => {
            e.stopPropagation();
            try {
              await adminApi.updateUser(r.id, { status: r.status === 'active' ? 'suspended' : 'active' });
              toast.success('User updated');
              setUsers((prev) => prev.map((u) => (u.id === r.id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u)));
            } catch {
              toast.error('Update failed');
            }
          }}
        >
          Toggle
        </Button>
      ),
    },
  ];

  return (
    <>
      <Helmet><title>Users — Admin</title></Helmet>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." className="max-w-md" />
        <DataTable columns={columns} data={paged} loading={loading} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
}
