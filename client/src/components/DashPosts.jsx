import { Modal, Table, Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to make authenticated requests
  const makeAuthRequest = async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  };

  // Handle authentication errors
  const handleAuthError = (error) => {
    console.error('Authentication error:', error);
    setError('Session expired. Please sign in again.');
    setTimeout(() => {
      navigate('/sign-in');
    }, 3000);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await makeAuthRequest(`/api/post/getposts?userId=${currentUser._id}`);
        const data = await res.json();
        
        if (res.ok) {
          setUserPosts(data.posts);
          if (data.posts.length < 9) {
            setShowMore(false);
          }
        } else if (res.status === 401) {
          handleAuthError('Unauthorized');
        } else {
          setError(data.message || 'Failed to fetch posts');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.isAdmin) {
      fetchPosts();
    }
  }, [currentUser._id, currentUser?.isAdmin]);

  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try {
      setLoading(true);
      const res = await makeAuthRequest(
        `/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`
      );
      const data = await res.json();
      
      if (res.ok) {
        setUserPosts((prev) => [...prev, ...data.posts]);
        if (data.posts.length < 9) {
          setShowMore(false);
        }
      } else if (res.status === 401) {
        handleAuthError('Unauthorized');
      } else {
        setError(data.message || 'Failed to load more posts');
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      setError('Failed to load more posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting to delete post:', postIdToDelete, 'by user:', currentUser._id);
      
      const res = await makeAuthRequest(
        `/api/post/deletepost/${postIdToDelete}/${currentUser._id}`,
        {
          method: 'DELETE',
        }
      );
      
      const data = await res.json();
      console.log('Delete response:', data);
      
      if (res.ok) {
        // Successfully deleted, update the UI
        setUserPosts((prev) =>
          prev.filter((post) => post._id !== postIdToDelete)
        );
        setPostIdToDelete('');
        console.log('Post deleted successfully');
      } else if (res.status === 401) {
        handleAuthError('Unauthorized - Please sign in again');
      } else {
        // Handle error response
        const errorMessage = data.message || `Error ${res.status}: Failed to delete post`;
        setError(errorMessage);
        console.error('Delete failed:', errorMessage);
      }
    } catch (error) {
      console.error('Network error during delete:', error);
      setError('Network error: Unable to delete post');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading && userPosts.length === 0) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
          <p className='mt-4 text-gray-600'>Loading posts...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className='p-3'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          <strong className='font-bold'>Error: </strong>
          <span className='block sm:inline'>{error}</span>
          <button
            onClick={() => window.location.reload()}
            className='ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (!currentUser?.isAdmin) {
    return (
      <div className='p-3 text-center'>
        <p className='text-gray-500 dark:text-gray-400'>
          You need admin privileges to manage posts.
        </p>
      </div>
    );
  }

  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {/* Header section with Create Post button */}
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-semibold text-gray-700 dark:text-gray-200'>
          My Posts ({userPosts.length})
        </h2>
        <Link to='/create-post'>
          <Button 
            gradientDuoTone='purpleToPink' 
            className='mb-2'
          >
            Create a post
          </Button>
        </Link>
      </div>

      {/* Error display */}
      {error && (
        <div className='mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          <span className='block sm:inline'>{error}</span>
          <button
            onClick={() => setError(null)}
            className='ml-4 text-red-500 hover:text-red-700'
          >
            ×
          </button>
        </div>
      )}

      {userPosts.length > 0 ? (
        <>
          <Table hoverable className='shadow-md'>
            <Table.Head>
              <Table.HeadCell>Date updated</Table.HeadCell>
              <Table.HeadCell>Post image</Table.HeadCell>
              <Table.HeadCell>Post title</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>
                <span>Edit</span>
              </Table.HeadCell>
            </Table.Head>
            {userPosts.map((post) => (
              <Table.Body className='divide-y' key={post._id}>
                <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                  <Table.Cell>
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Link to={`/post/${post.slug}`}>
                      <img
                        src={post.image}
                        alt={post.title}
                        className='w-20 h-10 object-cover bg-gray-500 rounded'
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x40?text=No+Image';
                        }}
                      />
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className='font-medium text-gray-900 dark:text-white hover:underline'
                      to={`/post/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <span className='bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300'>
                      {post.category || 'Uncategorized'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setPostIdToDelete(post._id);
                      }}
                      className='font-medium text-red-500 hover:underline cursor-pointer hover:bg-red-50 px-2 py-1 rounded'
                    >
                      Delete
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className='text-teal-500 hover:underline hover:bg-teal-50 px-2 py-1 rounded'
                      to={`/update-post/${post._id}`}
                    >
                      <span>Edit</span>
                    </Link>
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
          <div className='mb-4'>
            <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
          </div>
          <p className='text-gray-500 dark:text-gray-400 mb-4 text-lg'>
            You have no posts yet!
          </p>
          <p className='text-gray-400 dark:text-gray-500 mb-6 text-sm'>
            Create your first blog post to get started
          </p>
          <Link to='/create-post'>
            <Button 
              gradientDuoTone='purpleToPink'
              size='lg'
            >
              Create your first post
            </Button>
          </Link>
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
              Are you sure you want to delete this post?
            </h3>
            <p className='mb-5 text-sm text-gray-400 dark:text-gray-500'>
              This action cannot be undone. The post will be permanently removed.
            </p>
            <div className='flex justify-center gap-4'>
              <Button 
                color='failure' 
                onClick={handleDeletePost}
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