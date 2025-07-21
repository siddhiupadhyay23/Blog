import { useEffect, useState } from 'react';
import { Button, Modal, Table, Badge } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
// We'll format dates manually for now
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export default function DashMessages() {
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    // Get messages from localStorage instead of API
    const fetchMessages = () => {
      try {
        setLoading(true);
        const storedMessages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
        setMessages(storedMessages);
      } catch (error) {
        setError('Failed to load messages');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, []);

  const handleDeleteMessage = () => {
    try {
      // Delete from localStorage
      const storedMessages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
      const updatedMessages = storedMessages.filter(message => message.id !== messageToDelete.id);
      localStorage.setItem('contact_messages', JSON.stringify(updatedMessages));
      
      // Update state
      setMessages(messages.filter(message => message.id !== messageToDelete.id));
      setShowModal(false);
    } catch (error) {
      console.log('Error deleting message:', error);
    }
  };

  const handleMarkAsRead = (messageId) => {
    try {
      // Update in localStorage
      const storedMessages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
      const updatedMessages = storedMessages.map(message => 
        message.id === messageId ? { ...message, read: true } : message
      );
      localStorage.setItem('contact_messages', JSON.stringify(updatedMessages));
      
      // Update state
      setMessages(
        messages.map(message =>
          message.id === messageId ? { ...message, read: true } : message
        )
      );
    } catch (error) {
      console.log('Error marking message as read:', error);
    }
  };

  const handleViewMessage = (message) => {
    setCurrentMessage(message);
    setShowMessageModal(true);
    
    if (!message.read) {
      handleMarkAsRead(message._id);
    }
  };

  if (loading) return <div className="text-center">Loading messages...</div>;
  
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="w-full table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {messages.length === 0 ? (
        <p className="text-center my-10">No messages yet!</p>
      ) : (
        <>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>From</Table.HeadCell>
              <Table.HeadCell>Subject</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {messages.map((message) => (
                <Table.Row 
                  key={message.id} 
                  className={`${!message.read ? 'bg-blue-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                >
                  <Table.Cell>
                    {message.read ? (
                      <Badge color="gray">Read</Badge>
                    ) : (
                      <Badge color="info">New</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {formatDate(message.createdAt)}
                  </Table.Cell>
                  <Table.Cell>{message.name}</Table.Cell>
                  <Table.Cell>{message.subject}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        color="info" 
                        onClick={() => handleViewMessage(message)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        color="failure"
                        onClick={() => {
                          setShowModal(true);
                          setMessageToDelete(message);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          
          {/* Delete Confirmation Modal */}
          <Modal
            show={showModal}
            onClose={() => setShowModal(false)}
            popup
            size="md"
          >
            <Modal.Header />
            <Modal.Body>
              <div className="text-center">
                <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
                <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this message?
                </h3>
                <div className="flex justify-center gap-4">
                  <Button color="failure" onClick={handleDeleteMessage}>
                    Yes, I'm sure
                  </Button>
                  <Button color="gray" onClick={() => setShowModal(false)}>
                    No, cancel
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>
          
          {/* Message View Modal */}
          <Modal
            show={showMessageModal}
            onClose={() => setShowMessageModal(false)}
            size="lg"
          >
            <Modal.Header>
              {currentMessage?.subject}
            </Modal.Header>
            <Modal.Body>
              {currentMessage && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">From:</p>
                    <p>{currentMessage.name} ({currentMessage.email})</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date:</p>
                    <p>{formatDate(currentMessage.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Message:</p>
                    <p className="whitespace-pre-wrap">{currentMessage.message}</p>
                  </div>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setShowMessageModal(false)}>Close</Button>
              <Button
                color="failure"
                onClick={() => {
                  setShowMessageModal(false);
                  setShowModal(true);
                  setMessageToDelete(currentMessage);
                }}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}