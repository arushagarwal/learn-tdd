import { Response } from 'express';
import Book from '../models/book'; // Adjust the import to your Book model path
import BookInstance from '../models/bookinstance'; // Adjust the import to your BookInstance model path
import { showBookDtls } from '../pages/book_details'; // Adjust the import to where showBookDtls is defined

describe('showBookDtls', () => {
    let res: Partial<Response>;
    const mockBook = {
        title: 'Book Title 1',
        author: { name: 'Author 1' }
    };
    const mockCopies = [
        { imprint: 'Edition 1', status: 'Unavailable' },
        { imprint: 'Edition 2', status: 'Available' }
    ];

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(), 
            send: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks(); 
    });

    it('should return book details when the book and its copies exist', async () => {
        const mockFindOne = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockBook)
        });
        Book.findOne = mockFindOne;

        
        const mockFind = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(), 
            exec: jest.fn().mockResolvedValue(mockCopies)
        });
        BookInstance.find = mockFind;

        
        await showBookDtls(res as Response, '46532');

        
        expect(mockFindOne).toHaveBeenCalledWith({ _id: '46532' });
        expect(mockFindOne().populate).toHaveBeenCalledWith('author');
        expect(mockFind).toHaveBeenCalledWith({ book: '46532' });
        expect(mockFind().select).toHaveBeenCalledWith('imprint status');

        expect(res.send).toHaveBeenCalledWith({
            title: mockBook.title,
            author: mockBook.author.name,
            copies: mockCopies
        });
    });

    it('should return a 404 status when no copies of the book are found', async () => {
        const id = '837648';
        BookInstance.find = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(), 
            exec: jest.fn().mockResolvedValue(null)
        });

        await showBookDtls(res as Response, id);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(`Book details not found for book ${id}`);
    });

    it('should return a 500 status if an error occurs while fetching the book', async () => {
        Book.findOne = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });

        await showBookDtls(res as Response, '34687');
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error fetching book with id 34687');
    });

    it('should return a 404 status when the book ID is null', async () => {
        const id = null; // Passing null as the id
    
        const mockGetBook = jest.fn().mockResolvedValue(null);
        Book.findOne = mockGetBook;
    

        await showBookDtls(res as Response, id as unknown as string);
    
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(`Book with the ${id} not found`);
    });    

    it('should return a 500 status if an error occurs while fetching book copies', async () => {
        // Mocking the Book model's findOne method to throw an error
        BookInstance.find = jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        });

        await showBookDtls(res as Response, '12345');
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Error fetching book 12345');
    });
});