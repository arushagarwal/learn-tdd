import { Response } from "express";
import BookInstance from "../models/bookinstance";
import { showAllBooksStatus } from "../pages/books_status";

describe("showAllBooksStatus", () => {
    let res: Partial<Response>;
    const mockBookInstances = [
        { book: { title: "Book Title 1" }, status: "Available" },
        { book: { title: "Book Title 2" }, status: "Unavailable" },
    ];
    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return a list of books with status 'Available'", async () => {
        const mockFind = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockBookInstances)
        });
        BookInstance.find = mockFind;


        await showAllBooksStatus(res as Response);

        expect(mockFind).toHaveBeenCalledWith({ status: { $eq: "Available" } });
        expect(BookInstance.find().populate).toHaveBeenCalledWith('book');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([
            "Book Title 1: Available"
        ]);
    });

    it("should return a list of books with status 'Unavailable'", async () => {        
        const mockFind = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockBookInstances)
        });
        BookInstance.find = mockFind;
        
        await showAllBooksStatus(res as Response);

        expect(mockFind).toHaveBeenCalledWith({ status: { $eq: "Unavailable" } });
        expect(BookInstance.find().populate).toHaveBeenCalledWith('book');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([
            "Book Title 2: Unavailable"
        ]);
    });

    it("should return a 500 status and error message when a database error occurs", async () => {
        const mockFind = jest.fn().mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error("Database error found"))
        });
        BookInstance.find = mockFind;

        await showAllBooksStatus(res as Response);

        expect(mockFind).toHaveBeenCalledWith({ status: { $eq: "Available" } });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith("Status not found");
    });

    it("should return an empty list when no books with status 'Available' exist", async () => {
        const mockFind = jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue([])
        });
        BookInstance.find = mockFind;

        await showAllBooksStatus(res as Response);

        expect(mockFind).toHaveBeenCalledWith({ status: { $eq: "Available" } });
        expect(BookInstance.find().populate).toHaveBeenCalledWith('book');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith([]);
    });
});