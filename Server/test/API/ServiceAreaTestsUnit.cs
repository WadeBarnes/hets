/*
 * REST API Documentation for the MOTI School Bus Application
 *
 * The School Bus application tracks that inspections are performed in a timely fashion. For each school bus the application tracks information about the bus (including data from ICBC, NSC, etc.), it's past and next inspection dates and results, contacts, and the inspector responsible for next inspecting the bus.
 *
 * OpenAPI spec version: v1
 * 
 * 
 */

using System;
using Xunit;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.XPath;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Serialization;
using Npgsql;
using Microsoft.EntityFrameworkCore;
using Moq;
using HETSAPI;
using HETSAPI.Models;
using HETSAPI.Controllers;
using HETSAPI.Services.Impl;

namespace HETSAPI.Test
{
	public class ServiceAreaApiUnitTest 
    { 
		
		private readonly ServiceAreaController _ServiceAreaApi;
		
		/// <summary>
        /// Setup the test
        /// </summary>        
		public ServiceAreaApiUnitTest()
		{			
            DbContextOptions<DbAppContext> options = new DbContextOptions<DbAppContext>();
            Mock<DbAppContext> dbAppContext = new Mock<DbAppContext>(null, options);			                    
            ServiceAreaService _service = new ServiceAreaService(dbAppContext.Object);			
            _ServiceAreaApi = new ServiceAreaController (_service);
		}	
		
		[Fact]
		/// <summary>
        /// Unit test for ServiceareasGet
        /// </summary>
		public void TestServiceareasGet()
		{
			Assert.True(true);
		}		        
		
		[Fact]
		/// <summary>
        /// Unit test for ServiceareasIdDeletePost
        /// </summary>
		public void TestServiceareasIdDeletePost()
		{
			Assert.True(true);
		}		        
		
		[Fact]
		/// <summary>
        /// Unit test for ServiceareasIdGet
        /// </summary>
		public void TestServiceareasIdGet()
		{
			Assert.True(true);
		}		        
		
		[Fact]
		/// <summary>
        /// Unit test for ServiceareasIdPut
        /// </summary>
		public void TestServiceareasIdPut()
		{
			Assert.True(true);
		}		        
		
		[Fact]
		/// <summary>
        /// Unit test for ServiceareasPost
        /// </summary>
		public void TestServiceareasPost()
		{
			Assert.True(true);
		}		        
    }
}
