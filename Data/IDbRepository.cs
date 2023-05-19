namespace BawChat.Data
{
    public interface IDbRepository
    {
        Task<bool> SaveChangesAsync();
    }
}