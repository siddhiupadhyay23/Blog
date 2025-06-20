import { Modal, Table, Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching users...'); // Debug log
        console.log('Current user:', currentUser); // Debug current user
        console.log('Document cookies:', document.cookie); // Debug cookies
        
        // Get token from localStorage or Redux store
        const token = localStorage.getItem('access_token') || currentUser?.token;
        
        // Enhanced fetch with multiple auth methods
        const headers = {
          'Content-Type': 'application/json',
        };
        
        // Add Authorization header if token exists
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const res = await fetch('/api/user/getusers', {
          method: 'GET',
          headers,
          credentials: 'include' // Still include cookies as backup
        });
        
        const data = await res.json();
        
        console.log('Users response:', { status: res.status, data }); // Debug log
        
        if (res.ok) {
          setUsers(data.users || []);
          if ((data.users || []).length < 9) {
            setShowMore(false);
          }
        } else {
          // Handle specific auth errors
          if (res.status === 401 || res.status === 403) {
            setError('Authentication failed. Please log in again.');
            // Optionally redirect to login
            // window.location.href = '/sign-in';
          } else {
            const errorMsg = data.message || `Error ${res.status}: Failed to fetch users`;
            setError(errorMsg);
          }
          console.error('Fetch users error:', data);
        }
      } catch (error) {
        console.error('Network error:', error);
        setError('Network error: Unable to fetch users');
      } finally {
        setLoading(false);
      }
    };

    // Check if user exists and is admin
    if (currentUser && currentUser.isAdmin) {
      fetchUsers();
    } else if (currentUser && !currentUser.isAdmin) {
      setError('Admin privileges required to view users');
    } else if (!currentUser) {
      setError('Please log in to access this page');
    }
  }, [currentUser]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      setLoading(true);
      
      // Get token for show more request
      const token = localStorage.getItem('access_token') || currentUser?.token;
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/user/getusers?startIndex=${startIndex}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });
      const data = await res.json();
      
      if (res.ok) {
        setUsers((prev) => [...prev, ...(data.users || [])]);
        if ((data.users || []).length < 9) {
          setShowMore(false);
        }
      } else {
        if (res.status === 401 || res.status === 403) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(data.message || 'Failed to load more users');
        }
      }
    } catch (error) {
      console.error('Load more users error:', error);
      setError('Failed to load more users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      
      // Get token for delete request
      const token = localStorage.getItem('access_token') || currentUser?.token;
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });
      const data = await res.json();
      
      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
        setShowModal(false);
        setUserIdToDelete('');
      } else {
        if (res.status === 401 || res.status === 403) {
          setError('Authentication failed. Cannot delete user.');
        } else {
          setError(data.message || 'Failed to delete user');
        }
        setShowModal(false);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      setError('Failed to delete user');
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && users.length === 0) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
          <p className='mt-4 text-gray-600'>Loading users...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='p-3'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          <strong className='font-bold'>Error: </strong>
          <span className='block sm:inline'>{error}</span>
          <div className='mt-2 space-x-2'>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className='bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600'
            >
              Retry
            </button>
            {(error.includes('Authentication') || error.includes('log in')) && (
              <button
                onClick={() => {
                  // Clear any stored tokens and redirect to login
                  localStorage.removeItem('access_token');
                  window.location.href = '/sign-in';
                }}
                className='bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600'
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (!currentUser?.isAdmin) {
    return (
      <div className='p-3 text-center'>
        <p className='text-gray-500 dark:text-gray-400'>
          You need admin privileges to manage users.
        </p>
      </div>
    );
  }

  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {/* Header */}
      <div className='mb-4'>
        <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-200'>
          Users Management ({users.length})
        </h2>
      </div>

      {users.length > 0 ? (
        <>
          <Table hoverable className='shadow-md'>
            <Table.Head>
              <Table.HeadCell>Date created</Table.HeadCell>
              <Table.HeadCell>User image</Table.HeadCell>
              <Table.HeadCell>Username</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Admin</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            {users.map((user) => (
              <Table.Body className='divide-y' key={user._id}>
                <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                  <Table.Cell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className='w-10 h-10 object-cover bg-gray-500 rounded-full'
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/40x40?text=User';
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell className='font-medium'>{user.username}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    {user.isAdmin ? (
                      <div className='flex items-center text-green-500'>
                        <FaCheck className='mr-1' />
                        <span className='text-sm'>Admin</span>
                      </div>
                    ) : (
                      <div className='flex items-center text-gray-500'>
                        <FaTimes className='mr-1' />
                        <span className='text-sm'>User</span>
                      </div>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setUserIdToDelete(user._id);
                      }}
                      className='font-medium text-red-500 hover:underline cursor-pointer hover:bg-red-50 px-2 py-1 rounded'
                    >
                      Delete
                    </span>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
          
          {showMore && (
            <div className='flex justify-center mt-4'>
              <button
                onClick={handleShowMore}
                disabled={loading}
                className={`text-teal-500 self-center text-sm py-2 px-4 rounded hover:bg-teal-50 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Loading...' : 'Show more'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className='text-center py-8'>
          <p className='text-gray-500 dark:text-gray-400 text-lg'>
            No users found.
          </p>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size='md'
      >
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              Are you sure you want to delete this user?
            </h3>
            <p className='mb-5 text-sm text-gray-400 dark:text-gray-500'>
              This action cannot be undone. The user will be permanently removed.
            </p>
            <div className='flex justify-center gap-4'>
              <Button 
                color='failure' 
                onClick={handleDeleteUser}
                disabled={loading}
              >
                {loading ? 'Deleting...' : "Yes, I'm sure"}
              </Button>
              <Button 
                color='gray' 
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}