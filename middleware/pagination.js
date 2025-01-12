function paginate(req, res, next) {
    const { page = 1, limit = 3 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    totalPages = Math.ceil(req.paginationResource.length / limitNum);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0 || pageNum > totalPages) {
        return res.status(400).json({ message: "Invalid query parameters" });
    }

    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const results = req.paginationResource.slice(startIndex, endIndex);

    const paginatedResults = {
        results: results,
        totalPages: totalPages,
        totalResults: req.paginationResource.length,
    };

    if (pageNum < totalPages) {
        paginatedResults.next = {
            page: pageNum + 1,
            limit: limitNum,
        }
    }

    if (pageNum > 1) {
        paginatedResults.previous = {
            page: pageNum - 1,
            limit: limitNum,
        }
    }

    res.paginatedResults = paginatedResults;
    next();
}

module.exports = {
    paginate
};