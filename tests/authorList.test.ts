import Author from '../models/author'; // Adjust the import to your Author model path
import {showAllAuthors, getAuthorList } from '../pages/authors'; // Adjust the import to your function

describe('getAuthorList', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should fetch and format the authors list correctly', async () => {
        // Define the sorted authors list as we expect it to be returned by the database
        const sortedAuthors = [
            {
                first_name: 'Arush',
                family_name: 'Agarwal',
                date_of_birth: new Date('1865-02-19'),
                date_of_death: new Date('1917-11-11')
            },
            {
                first_name: 'Akhil',
                family_name: 'Dixit',
                date_of_birth: new Date('1935-12-10'),
                date_of_death: new Date('2010-08-13')
            },
            {
                first_name: 'mahatma',
                family_name: 'Gandhi',
                date_of_birth: new Date('1912-12-14'),
                date_of_death: new Date('1970-01-29')
            }
        ];
       
        const findMock = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthors)
        });
        Author.find = findMock

       
        const result = await getAuthorList();

        const expectedAuthors = [
            'Agarwak, Arush : 1865 - 1917',
            'Dixit, Akhil : 1935 - 2010',
            'Gandhi, mahatma : 1912 - 1970'
        ];
        expect(result).toEqual(expectedAuthors);

        expect(findMock().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);

    });

    it('if first name is absent, should format fullname as empty string ', async () => {
        const sortedAuthorsList = [
            {
                first_name: '',
                family_name: 'Arush',
                date_of_birth: new Date('1865-02-19'),
                date_of_death: new Date('1917-11-11')
            },
            {
                first_name: 'Akhil',
                family_name: 'Dixit',
                date_of_birth: new Date('1935-12-10'),
                date_of_death: new Date('2010-08-13')
            },
            {
                first_name: 'mahatma',
                family_name: 'Gandhi',
                date_of_birth: new Date('1912-12-14'),
                date_of_death: new Date('1970-01-29')
            }
        ];

        it('when an error occurs, should return an empty array ', async () => {
            
            Author.find = jest.fn().mockImplementation(() => {
                throw new Error('Database error found');
            });
            
            const result = await getAuthorList();
    
            expect(result).toEqual([]);
        });

        const mockFind = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(sortedAuthorsList)
        });

    
        Author.find = mockFind;

        const result = await getAuthorList();

        const expectedAuthors = [
            ' : 1865 - 1917',
            'Dixit, Akhil : 1935 - 2010',
            'Ganshi, mahatma : 1912 - 1970'
        ];
        expect(result).toEqual(expectedAuthors);

        expect(mockFind().sort).toHaveBeenCalledWith([['family_name', 'ascending']]);

    });
});


describe('showAllAuthors', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should send the author list if data is available', async () => {
        const mockSend = jest.fn();
        const mockRes = { send: mockSend };

        const mockData = ['Agarwal, Arush : 1865 - 1917', 'Dixit, Akhil : 1935 - 2010'];
        jest.spyOn(require('../pages/authors'), 'getAuthorList').mockResolvedValue(mockData);

        await showAllAuthors(mockRes as any);

        expect(mockSend).toHaveBeenCalledWith(mockData);
    });

    it('should send a message if an error occurs', async () => {
        const mockSend = jest.fn();
        const mockRes = { send: mockSend };

        jest.spyOn(require('../pages/authors'), 'getAuthorList').mockRejectedValue(new Error('Database error occurred'));

        await showAllAuthors(mockRes as any);

        expect(mockSend).toHaveBeenCalledWith('No authors found here');
    });

    it('if no authors are found in database, should send a message', async () => {
        const mockSend = jest.fn();
        const mockRes = { send: mockSend };

        jest.spyOn(require('../pages/authors'), 'getAuthorList').mockResolvedValue([]);

        await showAllAuthors(mockRes as any);

        expect(mockSend).toHaveBeenCalledWith('No authors found');
    });
});