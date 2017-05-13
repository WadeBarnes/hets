﻿using Hangfire.Console;
using Hangfire.Server;
using HETSAPI.Models;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Xml;
using System.Xml.Serialization;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;

namespace HETSAPI.Import

{
    public class ImportServiceArea
    {
        const string oldTable = "Service_Area";
        const string newTable = "ServiceArea";
        const string xmlFileName = "Service_Area.xml";

        /// <summary>
        /// Import existing service areas
        /// </summary>
        /// <param name="performContext"></param>
        /// <param name="dbContext"></param>
        /// <param name="fileLocation"></param>
        static public void Import(PerformContext performContext, DbAppContext dbContext, string fileLocation, string systemId)
        {
            try
            {
                string rootAttr = "ArrayOf" + oldTable;

                performContext.WriteLine("Processing Service Areas");
                var progress = performContext.WriteProgressBar();
                progress.SetValue(0);

                // create serializer and serialize xml file
                XmlSerializer ser = new XmlSerializer(typeof(HETSAPI.Import.Service_Area[]), new XmlRootAttribute(rootAttr));
                MemoryStream memoryStream = ImportUtility.memoryStreamGenerator(xmlFileName, oldTable, fileLocation, rootAttr);
                HETSAPI.Import.Service_Area[] legacyItems = (HETSAPI.Import.Service_Area[])ser.Deserialize(memoryStream);

                foreach (var item in legacyItems.WithProgress(progress))
                {
                    // see if we have this one already.
                    ImportMap importMap = dbContext.ImportMaps.FirstOrDefault(x => x.OldTable == oldTable && x.OldKey == item.Service_Area_Id.ToString());

                    if (importMap == null) // new entry
                    {
                        if (item.Service_Area_Cd > 0)
                        {
                            ServiceArea serviceArea = null;
                            CopyToInstance(performContext, dbContext, item, ref serviceArea, systemId);
                            ImportUtility.AddImportMap(dbContext, oldTable, item.Service_Area_Id.ToString(), newTable, serviceArea.Id);
                        }
                    }
                    else // update
                    {
                        ServiceArea serviceArea = dbContext.ServiceAreas.FirstOrDefault(x => x.Id == importMap.NewKey);
                        if (serviceArea == null) // record was deleted
                        {
                            CopyToInstance(performContext, dbContext, item, ref serviceArea, systemId);
                            // update the import map.
                            importMap.NewKey = serviceArea.Id;
                            dbContext.ImportMaps.Update(importMap);
                            dbContext.SaveChanges();
                        }
                        else // ordinary update.
                        {
                            CopyToInstance(performContext, dbContext, item, ref serviceArea, systemId);
                            // touch the import map.
                            importMap.LastUpdateTimestamp = DateTime.UtcNow;
                            dbContext.ImportMaps.Update(importMap);
                            dbContext.SaveChanges();
                        }
                    }
                }
                performContext.WriteLine("*** Done ***");
            }

            catch (Exception e)
            {
                performContext.WriteLine("*** ERROR ***");
                performContext.WriteLine(e.ToString());
            }
        }

        /// <summary>
        /// Copy from legacy to new record
        /// </summary>
        /// <param name="dbContext"></param>
        /// <param name="oldObject"></param>
        /// <param name="serviceArea"></param>
        static private void CopyToInstance(PerformContext performContext, DbAppContext dbContext, HETSAPI.Import.Service_Area oldObject, ref ServiceArea serviceArea, string systemId)
        {
            bool isNew = false;
            if (serviceArea == null)
            {
                isNew = true;
                serviceArea = new ServiceArea();
            }

            if (oldObject.Service_Area_Id <= 0)
                return;
            serviceArea.Id = oldObject.Service_Area_Id;
            serviceArea.MinistryServiceAreaID = oldObject.Service_Area_Id;
            serviceArea.DistrictId = oldObject.District_Area_Id;
            serviceArea.Name = oldObject.Service_Area_Desc.Trim();
            serviceArea.AreaNumber = oldObject.Service_Area_Cd;

            District district = dbContext.Districts.FirstOrDefault(x => x.MinistryDistrictID == oldObject.District_Area_Id);
            serviceArea.District = district;

            try
            {
                serviceArea.StartDate = DateTime.Parse(oldObject.FiscalStart.Trim().Substring(0, 10));
            }
            catch
            {

            }

            if (isNew)
            {
                serviceArea.CreateUserid = systemId;
                serviceArea.CreateTimestamp = DateTime.UtcNow;
                dbContext.ServiceAreas.Add(serviceArea);
            }
            else
            {
                serviceArea.LastUpdateUserid = systemId;
                serviceArea.LastUpdateTimestamp = DateTime.UtcNow;
                dbContext.ServiceAreas.Update(serviceArea);
            }
            try
            {
                dbContext.SaveChanges();
            }
            catch (Exception e)
            {
                performContext.WriteLine("*** ERROR With add or update Service Area ***");
                performContext.WriteLine(e.ToString());
            }
        }
    }
}

