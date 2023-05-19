namespace BawChat.Data
{
    public class SqliteDbRepository : IDbRepository
    {
        private readonly ChatDbContext _context;

        public SqliteDbRepository(ChatDbContext context)
        {
            _context = context;
        }

        public async Task<bool> SaveChangesAsync()
        {
            return (await _context.SaveChangesAsync()) > 0;
        }
    }
}