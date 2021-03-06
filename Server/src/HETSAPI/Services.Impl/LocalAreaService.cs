using System.Linq;
using Microsoft.AspNetCore.Mvc;
using HETSAPI.Models;

namespace HETSAPI.Services.Impl
{
    /// <summary>
    /// Local Area Service
    /// </summary>
    public class LocalAreaService : ILocalAreaService
    {
        private readonly DbAppContext _context;

        /// <summary>
        /// Local Area Service Constructor
        /// </summary>
        public LocalAreaService(DbAppContext context)
        {
            _context = context;
        }

        private void AdjustRecord(LocalArea item)
        {
            if (item != null && item.ServiceArea != null)
                item.ServiceArea = _context.ServiceAreas.FirstOrDefault(a => a.Id == item.ServiceArea.Id);
        }

        /// <summary>
        /// Create bulk local area service records
        /// </summary>
        /// <param name="items"></param>
        /// <response code="201">LocalArea created</response>
        public virtual IActionResult LocalAreasBulkPostAsync(LocalArea[] items)
        {
            if (items == null)
            {
                return new BadRequestResult();
            }

            foreach (LocalArea item in items)
            {
                AdjustRecord(item);

                // determine if this is an insert or an update            
                bool exists = _context.LocalAreas.Any(a => a.Id == item.Id);

                if (exists)
                {
                    _context.Update(item);
                }
                else
                {
                    _context.Add(item);
                }
            }

            // Save the changes
            _context.SaveChanges();

            return new NoContentResult();
        }        
    }
}
